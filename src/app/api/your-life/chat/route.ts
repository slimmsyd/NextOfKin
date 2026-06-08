import { NextResponse, after } from "next/server";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessageStreamWriter,
} from "ai";
import { randomUUID } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { validateAndApply } from "@/lib/yourLife/tools";
import { dataPartForResult, ASSET_TOOLS } from "@/lib/yourLife/dataParts";
import { resolveRecipientAssetId, type NewAsset } from "@/lib/yourLife/tools/resolveLinks";
import { isDesync, buildAgentTurnMeta } from "@/lib/yourLife/turnMeta";
import { loadChapterState } from "@/lib/yourLife/loadChapterState";
import { getChapter } from "@/lib/yourLife/chapters";
import { getBrain } from "@/lib/yourLife/brains";
import { chipsForProbe, openingProbe } from "@/lib/yourLife/interviewFlow";
import { flushTraces } from "@/lib/yourLife/tracing";

export const runtime = "nodejs";

type IncomingMessage = {
  role: "user" | "assistant";
  parts?: Array<{ type: string; text?: string }>;
  content?: string;
};

function lastUserText(messages: IncomingMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    if (m.parts) {
      const text = m.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join(" ")
        .trim();
      if (text) return text;
    }
    if (m.content) return m.content;
  }
  return "";
}

// Backstop for the no-em-dash product rule (model output is user-facing).
function sanitizeReply(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ", ");
}

async function streamReplyText(writer: UIMessageStreamWriter, text: string) {
  const id = `text-${randomUUID()}`;
  writer.write({ type: "text-start", id });
  // Stream word-by-word for the human feel. Real Claude streams tokens at ~30-50 tok/s.
  const words = text.split(/(\s+)/);
  for (const word of words) {
    if (!word) continue;
    writer.write({ type: "text-delta", id, delta: word });
    await new Promise((r) => setTimeout(r, 32));
  }
  writer.write({ type: "text-end", id });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const messages: IncomingMessage[] = body.messages;
  const chapter: string = body.chapter ?? "real_estate";
  const inputMethod: "voice" | "text" =
    body.inputMethod === "voice" ? "voice" : "text";
  // Which recommended-question chip seeded this message, if any (tap-through).
  const chipSource: string | null =
    typeof body.chipSource === "string" ? body.chipSource : null;

  const chapterDef = getChapter(chapter);
  const brain = getBrain(chapter);
  if (!chapterDef || !brain) {
    return NextResponse.json({ error: "Unknown chapter" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userRow = await prisma.user.findUnique({
    where: { authUserId: auth.user.id },
    select: { id: true, stateCode: true },
  });
  if (!userRow) {
    return NextResponse.json({ error: "No user profile" }, { status: 404 });
  }

  const stateResult = await loadChapterState(chapter);
  if (!stateResult.ok) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }
  const state = stateResult.state;

  const userText = lastUserText(messages);

  // Persist the user turn first so resume reflects the full transcript, and
  // mark the chapter active on first interaction (no-op if already started).
  if (userText) {
    await prisma.conversationTurn.create({
      data: {
        userId: userRow.id,
        chapter,
        role: "user",
        text: userText,
        inputMethod,
        meta: chipSource ? { chipSource } : undefined,
      },
    });
    await prisma.chapterProgress.upsert({
      where: { userId_chapter: { userId: userRow.id, chapter } },
      create: {
        userId: userRow.id,
        chapter,
        status: "active",
        startedAt: new Date(),
      },
      update: {},
    });
  }

  const turn = await brain(state, userText, { inputMethod });
  const replyText = sanitizeReply(turn.text);

  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({ type: "start" });

      // Stream tool calls first (so the right pane updates before / during text).
      // Apply asset captures BEFORE recipients (add_person), then progression
      // (confirm/defer) last: a person named for an asset created THIS turn has
      // no id to link to until that asset is applied, so we collect the new
      // assets first and resolve the recipient link against them. Stable sort
      // preserves model-emitted order within each group.
      const phaseOf = (name: string) =>
        name === "add_person"
          ? 1
          : name === "confirm_chapter_complete" || name === "defer_chapter"
            ? 2
            : 0;
      const orderedCalls = [...turn.toolCalls].sort(
        (a, b) => phaseOf(a.name) - phaseOf(b.name),
      );
      const appliedResults: Array<{ name: string; data: unknown }> = [];
      const failedNames: string[] = [];
      const newAssetsThisTurn: NewAsset[] = [];
      for (const call of orderedCalls) {
        // Resolve a same-turn recipient link: if this person should receive an
        // asset created earlier in THIS loop, fill asset_id from its new id.
        let args = call.args;
        if (call.name === "add_person") {
          const resolved = resolveRecipientAssetId(
            args as { asset_id?: string | null; receives_new_asset_label?: string | null },
            newAssetsThisTurn,
          );
          if (resolved) args = { ...args, asset_id: resolved };
        }
        const toolCallId = `tc-${randomUUID()}`;
        writer.write({
          type: "tool-input-available",
          toolCallId,
          toolName: call.name,
          input: args,
        });
        const result = await validateAndApply(
          { name: call.name, args },
          { prisma, userId: userRow.id, stateCode: userRow.stateCode },
        );
        if (result.ok) {
          appliedResults.push({ name: result.name, data: result.data });
          // Track assets created this turn (id + label) so a later add_person
          // can link to one by label (resolveRecipientAssetId).
          if (ASSET_TOOLS.has(result.name)) {
            const d = result.data as { id?: string; institution?: string | null };
            if (d && typeof d.id === "string") {
              newAssetsThisTurn.push({ id: d.id, label: d.institution ?? null });
            }
          }
          writer.write({
            type: "tool-output-available",
            toolCallId,
            output: result.data,
          });
          // Live pane updates ride TRANSIENT data-* parts, the only channel
          // useChat delivers to onData (tool-output-available does NOT reach it).
          const part = dataPartForResult(result);
          if (part) {
            writer.write({ ...part, transient: true });
          }
        } else {
          failedNames.push(result.name);
          writer.write({
            type: "tool-output-error",
            toolCallId,
            errorText: result.error,
          });
        }
      }

      if (appliedResults.length) {
        console.log(
          "[route] applied tools:",
          appliedResults.map((r) => r.name).join(", "),
        );
      }

      // Then stream the agent reply text.
      await streamReplyText(writer, replyText);

      // Recommended next questions: deterministic chips for the same topic Ava
      // was just steered toward (so they match her question). Transient — they
      // drive UI state, not message history.
      const chips = chipsForProbe(
        turn.nextProbe ?? openingProbe(chapterDef.id),
        chapterDef.id,
      );
      writer.write({ type: "data-suggestions", data: chips, transient: true });

      writer.write({ type: "finish" });

      // Capture-intelligence signals: what the user said vs what the agent
      // actually captured this turn. `desync` is the production canary (substantive
      // input, zero capture) for the bug class we fixed. See turnMeta.ts.
      const emitted = turn.toolCalls.map((c) => c.name);
      const desync = isDesync(userText, emitted);
      if (desync) {
        console.warn(
          "[route] DESYNC: substantive input captured nothing:",
          userText.slice(0, 80),
        );
      }
      const meta = buildAgentTurnMeta({
        probe: turn.nextProbe
          ? { kind: turn.nextProbe.kind, topic: turn.nextProbe.topic }
          : null,
        emitted,
        applied: appliedResults.map((r) => r.name),
        failed: failedNames,
        chipsShown: chips.map((c) => c.id),
      });

      // Persist the agent turn (after streaming so DB reflects the full reply).
      await prisma.conversationTurn.create({
        data: {
          userId: userRow.id,
          chapter,
          role: "agent",
          text: replyText,
          toolCalls: appliedResults.length
            ? (appliedResults as unknown as object[])
            : undefined,
          bucket: turn.bucket,
          desync,
          meta: meta as object,
        },
      });
    },
    onError: (e) => (e instanceof Error ? e.message : "Stream error"),
  });

  // Flush any LangSmith trace batches after the response is sent (no-op unless
  // tracing is enabled). The brain's LLM calls already ran above, so the spans
  // are queued by now.
  after(flushTraces);

  return createUIMessageStreamResponse({ stream });
}
