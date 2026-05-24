"use client";

import type { ReactNode } from "react";

type RepeaterProps<T> = {
  items: T[];
  addLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
};

function PlusIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

export function Repeater<T>({
  items,
  addLabel,
  onAdd,
  onRemove,
  renderItem,
}: RepeaterProps<T>) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg bg-white border border-[#DFDFE4] px-3 py-2"
        >
          <div className="flex-1 min-w-0">{renderItem(item, i)}</div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Remove item ${i + 1}`}
            className="cursor-pointer p-2 rounded-md text-foreground/40 hover:text-[#B23B3B] hover:bg-foreground/5 transition-colors"
          >
            <TrashIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="cursor-pointer w-full h-[50px] flex items-center gap-2 px-4 rounded-lg border border-dashed border-[#DFDFE4] text-sm text-foreground/60 hover:text-brand-indigo hover:border-brand-indigo/40 hover:bg-surface-lavender-200/40 transition-colors"
      >
        <PlusIcon />
        {addLabel}
      </button>
    </div>
  );
}
