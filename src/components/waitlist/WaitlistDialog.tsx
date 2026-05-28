"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Button, TextInput, Select } from "@/components/forms";
import { joinWaitlistAction } from "@/lib/waitlist/action";

const LOCAL_STORAGE_KEY = "nok_waitlist_joined";
const OPEN_EVENT = "waitlist:open";

const GENDER_OPTIONS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const AGE_OPTIONS = [
  { value: "under_25", label: "Under 25" },
  { value: "age_25_34", label: "25 to 34" },
  { value: "age_35_44", label: "35 to 44" },
  { value: "age_45_54", label: "45 to 54" },
  { value: "age_55_64", label: "55 to 64" },
  { value: "age_65_plus", label: "65 or older" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

type View = "form" | "thanks";

function CloseIcon() {
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
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}

export function WaitlistDialog() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("form");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cardRef = useRef<HTMLDivElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
    const prev = previousFocusRef.current;
    if (prev) prev.focus({ preventScroll: true });
  }, []);

  // Listen for the global open event.
  useEffect(() => {
    const onOpen = () => {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const joined =
        typeof window !== "undefined" &&
        window.localStorage.getItem(LOCAL_STORAGE_KEY) === "1";
      setView(joined ? "thanks" : "form");
      setError(null);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Scroll lock + Esc + focus management while open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKey);

    const t = window.setTimeout(() => {
      if (view === "form") emailRef.current?.focus({ preventScroll: true });
    }, 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, view, close]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await joinWaitlistAction(formData);
      if (result.ok) {
        try {
          window.localStorage.setItem(LOCAL_STORAGE_KEY, "1");
        } catch {
          /* ignore */
        }
        setView("thanks");
        setError(null);
      } else {
        setError(result.error);
      }
    });
  };

  // `open` only flips to true via the client-side event listener, so SSR
  // always emits null and hydration stays consistent.
  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Close on backdrop click but not on card click. mousedown is used
        // so a click that started inside the card and ended on the backdrop
        // (rare drag) doesn't dismiss.
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-7 md:p-9"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close waitlist"
          className="cursor-pointer absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-full text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40"
        >
          <CloseIcon />
        </button>

        {view === "form" ? (
          <>
            <h2
              id="waitlist-title"
              className="font-serif text-[28px] md:text-[32px] text-foreground leading-[1.1] tracking-tight pr-8"
            >
              Be the first to know.{" "}
              <span className="italic text-brand-indigo">Join the waitlist.</span>
            </h2>
            <p className="mt-3 text-[14px] text-foreground/65 leading-[1.55]">
              We&rsquo;ll let you know the moment NextOfKin opens to your family.
              Email is all we need.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              {/* Honeypot. Real users never see or fill this. */}
              <div className="sr-only" aria-hidden>
                <label htmlFor="waitlist-website">
                  Leave this field empty
                </label>
                <input
                  id="waitlist-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <input type="hidden" name="source" value="landing" />

              <TextInput
                ref={emailRef}
                name="email"
                type="email"
                label="Email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                error={error}
              />

              <TextInput
                name="first_name"
                type="text"
                label="First name (optional)"
                placeholder="What should we call you"
                autoComplete="given-name"
                maxLength={80}
              />

              <TextInput
                name="phone"
                type="tel"
                label="Phone (optional)"
                placeholder="So we can text you when we open"
                autoComplete="tel"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  name="gender"
                  label="Gender (optional)"
                  placeholder="Select"
                  defaultValue=""
                  options={GENDER_OPTIONS}
                />
                <Select
                  name="age_bracket"
                  label="Age (optional)"
                  placeholder="Select"
                  defaultValue=""
                  options={AGE_OPTIONS}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                tone="indigo"
                size="md"
                fullWidth
                disabled={isPending}
              >
                {isPending ? "Adding you" : "Join the waitlist"}
              </Button>
            </form>

            <p className="mt-4 text-[12px] text-foreground/55 leading-[1.5]">
              Your information is encrypted and never sold.
            </p>
          </>
        ) : (
          <>
            <h2
              id="waitlist-title"
              className="font-serif text-[28px] md:text-[32px] text-foreground leading-[1.1] tracking-tight pr-8"
            >
              <span className="italic text-brand-indigo">Thanks.</span> You&rsquo;re
              on the list.
            </h2>
            <p className="mt-3 text-[14px] text-foreground/65 leading-[1.55]">
              We&rsquo;ll be in touch as soon as we open to your family.
            </p>
            <div className="mt-7">
              <Button
                type="button"
                variant="primary"
                tone="indigo"
                size="md"
                fullWidth
                onClick={close}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
