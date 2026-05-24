"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput } from "@/components/forms";
import { SocialAuthButtons } from "./SocialAuthButtons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const first_name = String(data.get("first_name") ?? "").trim();
    const last_name = String(data.get("last_name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (!first_name || !last_name) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/setup");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-[340px]">
      <header className="text-center">
        <h1 className="font-serif text-[2rem] leading-[1.2] text-foreground">
          Create an account
        </h1>
        <p className="mt-2 text-[13px] text-foreground/65">
          Already have an account?{" "}
          <Link
            href="/signup"
            className="text-brand-indigo font-medium hover:underline cursor-pointer"
          >
            Log in
          </Link>
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-7 space-y-3" noValidate>
        <TextInput
          name="first_name"
          type="text"
          autoComplete="given-name"
          required
          placeholder="First name"
          aria-label="First name"
        />
        <TextInput
          name="last_name"
          type="text"
          autoComplete="family-name"
          required
          placeholder="Last name"
          aria-label="Last name"
        />
        <TextInput
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email"
          aria-label="Email"
        />

        {error ? (
          <p
            role="alert"
            className="text-[12px] text-[#B23B3B] bg-[#FFF5F5] border border-[#FFD9D9] rounded-lg px-3 py-2"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          tone="ink"
          size="lg"
          fullWidth
          disabled={pending}
        >
          {pending ? "Saving…" : "Next"}
        </Button>
      </form>

      <div
        className="my-5 flex items-center gap-4"
        role="separator"
        aria-label="or"
      >
        <div className="flex-1 border-t border-[#DFDFE4]" />
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/50">
          OR
        </span>
        <div className="flex-1 border-t border-[#DFDFE4]" />
      </div>

      <SocialAuthButtons />

      <p className="mt-6 text-center text-[11px] text-foreground/55 leading-relaxed">
        By continuing, you agree to our{" "}
        <Link
          href="#"
          className="text-brand-indigo hover:underline cursor-pointer"
        >
          Terms of Use
        </Link>{" "}
        and acknowledge our{" "}
        <Link
          href="#"
          className="text-brand-indigo hover:underline cursor-pointer"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <div className="mt-8 pt-6 border-t border-[#EEEEF1]">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
          Built for our families
        </p>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-foreground/55">
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="w-1 h-1 rounded-full bg-brand-indigo/60"
            />
            North Carolina, V1
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="w-1 h-1 rounded-full bg-brand-indigo/60"
            />
            Attorney-reviewed
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="w-1 h-1 rounded-full bg-brand-indigo/60"
            />
            Pause anytime
          </li>
        </ul>
      </div>
    </div>
  );
}
