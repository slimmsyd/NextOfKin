"use client";

import { useEffect, useRef, useState } from "react";

type InlineEditableFieldProps = {
  label: string;
  value: string | null;
  placeholder?: string;
  align?: "left" | "right";
  onCommit: (next: string) => void | Promise<void>;
};

// Local draft state lives only during editing. Outside of edit mode the field
// renders straight from the `value` prop so external updates (e.g. an agent
// tool call) take effect immediately without prop-to-state sync gymnastics.
export function InlineEditableField({
  label,
  value,
  placeholder = "Not yet captured",
  align = "right",
  onCommit,
}: InlineEditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEditing = () => {
    setDraft(value ?? "");
    setEditing(true);
  };

  const commit = async () => {
    const next = draft.trim();
    setEditing(false);
    if (next === (value ?? "")) return;
    await onCommit(next);
  };

  const cancel = () => {
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-foreground/55">{label}</span>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          className="text-sm bg-white border border-brand-indigo/40 rounded-md px-2 py-1 outline-none focus:border-brand-indigo min-w-0 max-w-[60%]"
        />
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className={`cursor-text text-sm text-foreground hover:bg-surface-lavender-200 rounded-md px-2 py-1 -mx-2 transition-colors text-${align}`}
        >
          {value && value.length > 0 ? (
            value
          ) : (
            <span className="italic text-foreground/50">{placeholder}</span>
          )}
        </button>
      )}
    </div>
  );
}
