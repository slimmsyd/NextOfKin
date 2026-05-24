"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button, TextInput } from "@/components/forms";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { signupAction } from "@/app/signup/actions";

export function SignupForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signupAction(formData);
      if (!result.ok) {
        setError(result.error);
      }
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
            href="/signin"
            className="text-brand-indigo font-medium hover:underline cursor-pointer"
          >
            Log in
          </Link>
        </p>
      </header>

      <form action={handleAction} className="mt-7 space-y-3" noValidate>
        <TextInput
          name="first_name"
          type="text"
          autoComplete="given-name"
          required
          maxLength={80}
          placeholder="First name"
          aria-label="First name"
        />
        <TextInput
          name="last_name"
          type="text"
          autoComplete="family-name"
          required
          maxLength={80}
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
        <TextInput
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Password (8+ characters)"
          aria-label="Password"
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
          tone="indigo"
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
