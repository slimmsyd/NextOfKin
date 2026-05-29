"use client";

import { useEffect, useRef } from "react";

import { VoiceNarrator } from "@/components/voice";
import { AutoSaveBadge, type AutoSaveStatus } from "@/components/forms";
import { AGENT_NAME } from "@/lib/voice/agent";
import { AgentMessage } from "./AgentMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { UserMessage } from "./UserMessage";

export type ChatPaneMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  bucket: string | null;
};

type ChatPaneProps = {
  messages: ChatPaneMessage[];
  isStreaming: boolean;
  disabled: boolean;
  onSubmit: (text: string, inputMethod: "voice" | "text") => void;
  saveStatus?: AutoSaveStatus;
};

function AgentAvatar({
  status,
  saveStatus,
}: {
  status: string;
  saveStatus?: AutoSaveStatus;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-6 md:px-10 py-4 border-b border-surface-lavender-300 bg-surface-lavender-100/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-brand-violet to-brand-violet-end font-serif text-[15px] italic text-white"
        >
          {AGENT_NAME.charAt(0)}
        </span>
        <div className="flex flex-col leading-tight min-w-0">
          <p className="text-[14px] font-semibold text-foreground">
            {AGENT_NAME} <span className="font-normal text-foreground/55">· your agent</span>
          </p>
          <p className="text-[12px] text-foreground/55 truncate">{status}</p>
        </div>
      </div>
      {saveStatus ? <AutoSaveBadge status={saveStatus} /> : null}
    </div>
  );
}

export function ChatPane({
  messages,
  isStreaming,
  disabled,
  onSubmit,
  saveStatus,
}: ChatPaneProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  return (
    <section className="flex flex-col h-full bg-surface-lavender-100">
      <AgentAvatar
        status={isStreaming ? "Listening" : "Here when you're ready"}
        saveStatus={saveStatus}
      />
      <div className="px-6 md:px-10 pt-3">
        <VoiceNarrator scene="your-life-real-estate" className="mb-1" />
      </div>

      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-6 md:px-10 py-4 space-y-4"
      >
        {messages.map((m) =>
          m.role === "agent" ? (
            <AgentMessage key={m.id} text={m.text} bucket={m.bucket} />
          ) : (
            <UserMessage key={m.id} text={m.text} />
          ),
        )}
        {isStreaming &&
        (messages.length === 0 || messages[messages.length - 1].role === "user") ? (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        ) : null}
      </div>

      <ChatInput disabled={disabled} onSubmit={onSubmit} />
    </section>
  );
}
