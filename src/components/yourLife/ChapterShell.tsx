"use client";

import { useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

import { type AutoSaveStatus } from "@/components/forms";
import { applyToolCall } from "@/app/your-life/actions";
import { ChatPane, type ChatPaneMessage } from "./ChatPane";
import { ProfilePane } from "./ProfilePane";
import { YourLifeSidebar } from "./YourLifeSidebar";
import type {
  AssetView,
  ChatTurnView,
  FamilyView,
  IdentityView,
  SidebarSection,
} from "./types";

type ChapterShellProps = {
  identity: IdentityView;
  family: FamilyView;
  sections: SidebarSection[];
  initialAssets: AssetView[];
  initialTurns: ChatTurnView[];
  chapter: string;
};

function turnsToUIMessages(turns: ChatTurnView[]): UIMessage[] {
  return turns.map((t) => ({
    id: t.id,
    role: t.role === "agent" ? "assistant" : "user",
    parts: [{ type: "text", text: t.text }],
  }));
}

function extractText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function uiMessageToChatPane(m: UIMessage): ChatPaneMessage {
  return {
    id: m.id,
    role: m.role === "assistant" ? "agent" : "user",
    text: extractText(m),
    bucket: null,
  };
}

type AssetRecord = {
  id?: string;
  type?: string;
  institution?: string | null;
  identifier?: string | null;
  estimatedValue?: string | null;
  acquisitionSource?: string | null;
  titleStatus?: string | null;
  deedRecorded?: boolean | null;
  createdAt?: string | Date;
};

function recordToAssetView(rec: AssetRecord): AssetView | null {
  if (!rec.id) return null;
  return {
    id: rec.id,
    type: rec.type ?? "real_estate",
    label: rec.institution ?? null,
    location: rec.identifier ?? null,
    estimatedValue: rec.estimatedValue ?? null,
    acquisitionSource: rec.acquisitionSource ?? null,
    titleStatus: rec.titleStatus ?? null,
    deedRecorded: rec.deedRecorded ?? null,
    createdAt:
      typeof rec.createdAt === "string"
        ? rec.createdAt
        : rec.createdAt instanceof Date
          ? rec.createdAt.toISOString()
          : new Date().toISOString(),
  };
}

export function ChapterShell({
  identity,
  family,
  sections,
  initialAssets,
  initialTurns,
  chapter,
}: ChapterShellProps) {
  const [assets, setAssets] = useState<AssetView[]>(initialAssets);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [editSaveStatus, setEditSaveStatus] = useState<AutoSaveStatus>("idle");
  const lastAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/your-life/chat",
        body: { chapter },
      }),
    [chapter],
  );

  // onData receives every raw stream chunk; tool outputs land here without
  // forcing us to setState inside an effect that watches `messages`.
  const onData = (data: { type: string } & Record<string, unknown>) => {
    if (data.type !== "tool-output-available") return;
    const toolName = data.toolName as string | undefined;
    const output = data.output as AssetRecord | undefined;
    if (!toolName || !output) return;

    if (toolName === "add_real_estate" || toolName === "add_financial_account") {
      const view = recordToAssetView(output);
      if (!view) return;
      setAssets((prev) =>
        prev.some((a) => a.id === view.id) ? prev : [...prev, view],
      );
      setLastAddedId(view.id);
      if (lastAddedTimer.current) clearTimeout(lastAddedTimer.current);
      lastAddedTimer.current = setTimeout(() => setLastAddedId(null), 4000);
    } else if (toolName === "flag_heirs_property_risk") {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === output.id
            ? {
                ...a,
                titleStatus: output.titleStatus ?? a.titleStatus,
                deedRecorded:
                  output.deedRecorded === undefined
                    ? a.deedRecorded
                    : output.deedRecorded,
              }
            : a,
        ),
      );
    } else if (toolName === "update_asset_field") {
      const view = recordToAssetView(output);
      if (view) {
        setAssets((prev) => prev.map((a) => (a.id === view.id ? view : a)));
      }
    }
  };

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: turnsToUIMessages(initialTurns),
    onData,
  });

  // Save status is derived from the chat lifecycle PLUS the inline-edit
  // lifecycle. Inline edits set editSaveStatus explicitly; the chat status
  // contributes when no edit is pending.
  const chatDerivedStatus: AutoSaveStatus =
    status === "submitted" || status === "streaming"
      ? "saving"
      : status === "error"
        ? "error"
        : "idle";
  const saveStatus: AutoSaveStatus =
    editSaveStatus !== "idle" ? editSaveStatus : chatDerivedStatus;

  const onSubmit = (text: string) => {
    sendMessage({ text });
  };

  const onFieldChange = async (
    assetId: string,
    field: "label" | "location",
    value: string,
  ) => {
    setEditSaveStatus("saving");
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, [field]: value } : a)),
    );
    const result = await applyToolCall({
      name: "update_asset_field",
      args: { asset_id: assetId, field, value },
    });
    if (result.ok) {
      const view = recordToAssetView(result.data as AssetRecord);
      if (view) {
        setAssets((prev) => prev.map((a) => (a.id === view.id ? view : a)));
      }
      setEditSaveStatus("saved");
      if (editTimer.current) clearTimeout(editTimer.current);
      editTimer.current = setTimeout(() => setEditSaveStatus("idle"), 1800);
    } else {
      setEditSaveStatus("error");
    }
  };

  const chatMessages = messages.map(uiMessageToChatPane);
  const isStreaming = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-screen bg-surface-lavender-100 overflow-hidden">
      <YourLifeSidebar
        identity={identity}
        sections={sections}
        phaseTitle="Your life"
      />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        <div className="md:col-span-7 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-surface-lavender-300">
          <ChatPane
            messages={chatMessages}
            isStreaming={isStreaming}
            disabled={isStreaming}
            onSubmit={onSubmit}
            saveStatus={saveStatus}
          />
        </div>
        <div className="md:col-span-5 overflow-hidden">
          <ProfilePane
            identity={identity}
            family={family}
            assets={assets}
            lastAddedId={lastAddedId}
            onFieldChange={onFieldChange}
          />
        </div>
      </div>
    </div>
  );
}
