"use client";

import { useEffect, useRef } from "react";

import { VoiceNarrator } from "@/components/voice";
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
  onSubmit: (text: string) => void;
};

function AgentAvatar({ status }: { status: string }) {
  return (
    <div className="flex items-center gap-3 px-6 md:px-10 py-4 border-b border-surface-lavender-300 bg-surface-lavender-100/80 backdrop-blur-sm">
      <span
        aria-hidden
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-lavender-300 text-brand-indigo font-semibold text-sm"
      >
        K
      </span>
      <div className="flex flex-col leading-tight">
        <p className="text-[14px] font-semibold text-foreground">NextOfKin</p>
        <p className="text-[12px] text-foreground/55">{status}</p>
      </div>
    </div>
  );
}

export function ChatPane({
  messages,
  isStreaming,
  disabled,
  onSubmit,
}: ChatPaneProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  return (
    <section className="flex flex-col h-full bg-surface-lavender-100">
      <AgentAvatar status={isStreaming ? "Listening" : "Here when you're ready"} />
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
