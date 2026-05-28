import { NextResponse } from "next/server";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessageStreamWriter,
} from "ai";
import { randomUUID } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { validateAndApply } from "@/lib/yourLife/tools";
import { loadChapterState } from "@/lib/yourLife/loadChapterState";
import { nextTurn } from "@/lib/yourLife/scripts/realEstateScript";

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

  // Persist the user turn first so resume reflects the full transcript.
  if (userText) {
    await prisma.conversationTurn.create({
      data: {
        userId: userRow.id,
        chapter,
        role: "user",
        text: userText,
      },
    });
  }

  const turn = nextTurn(state, userText);

  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({ type: "start" });

      // Stream tool calls first (so the right pane updates before / during text).
      const appliedResults: Array<{ name: string; data: unknown }> = [];
      for (const call of turn.toolCalls) {
        const toolCallId = `tc-${randomUUID()}`;
        writer.write({
          type: "tool-input-available",
          toolCallId,
          toolName: call.name,
          input: call.args,
        });
        const result = await validateAndApply(
          { name: call.name, args: call.args },
          { prisma, userId: userRow.id, stateCode: userRow.stateCode },
        );
        if (result.ok) {
          appliedResults.push({ name: result.name, data: result.data });
          writer.write({
            type: "tool-output-available",
            toolCallId,
            output: result.data,
          });
        } else {
          writer.write({
            type: "tool-output-error",
            toolCallId,
            errorText: result.error,
          });
        }
      }

      // Then stream the agent reply text.
      await streamReplyText(writer, turn.text);

      writer.write({ type: "finish" });

      // Persist the agent turn (after streaming so DB reflects the full reply).
      await prisma.conversationTurn.create({
        data: {
          userId: userRow.id,
          chapter,
          role: "agent",
          text: turn.text,
          toolCalls: appliedResults.length
            ? (appliedResults as unknown as object[])
            : undefined,
          bucket: turn.bucket,
        },
      });
    },
    onError: (e) => (e instanceof Error ? e.message : "Stream error"),
  });

  return createUIMessageStreamResponse({ stream });
}
