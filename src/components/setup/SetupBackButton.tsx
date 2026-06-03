"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/forms";

function ChevronLeftIcon() {
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

type SetupBackButtonProps = {
  /** Where to navigate after the user confirms leaving or going back. */
  leaveHref: string;
  confirmTitle?: string;
};

function SetupLeaveConfirm({
  open,
  onStay,
  onLeave,
  title,
  titleId,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
  title: string;
  titleId: string;
}) {
  const stayRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onStay();
      }
    };
    document.addEventListener("keydown", onKey);

    const t = window.setTimeout(() => {
      stayRef.current?.focus({ preventScroll: true });
    }, 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onStay]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/35 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onStay();
      }}
    >
      <div className="relative w-full max-w-[19rem] bg-white rounded-xl border border-surface-lavender-300 shadow-lg px-5 py-5">
        <h2
          id={titleId}
          className="font-serif text-[22px] text-foreground leading-[1.15] tracking-tight"
        >
          {title}
        </h2>
        <p className="mt-2.5 text-[13px] text-foreground/65 leading-[1.55]">
          Your spot and progress are saved. You can come back and pick up where
          you left off.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end sm:items-center">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            className="sm:w-auto"
            onClick={onLeave}
          >
            Leave
          </Button>
          <Button
            ref={stayRef}
            type="button"
            variant="primary"
            tone="indigo"
            size="md"
            fullWidth
            className="sm:w-auto"
            onClick={onStay}
          >
            Stay
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function SetupBackButton({
  leaveHref,
  confirmTitle = "Leave for now?",
}: SetupBackButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const titleId = useId();

  const handleLeave = useCallback(() => {
    setConfirmOpen(false);
    router.push(leaveHref);
  }, [leaveHref, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="cursor-pointer inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-1 -ml-2 text-[13px] font-medium text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40"
      >
        <ChevronLeftIcon />
        Back
      </button>
      <SetupLeaveConfirm
        open={confirmOpen}
        titleId={titleId}
        title={confirmTitle}
        onStay={() => setConfirmOpen(false)}
        onLeave={handleLeave}
      />
    </>
  );
}
