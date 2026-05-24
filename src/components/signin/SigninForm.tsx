"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button, TextInput } from "@/components/forms";
import { SocialAuthButtons } from "@/components/signup/SocialAuthButtons";
import { signinAction } from "@/app/signin/actions";

export function SigninForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signinAction(formData);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="w-full max-w-[340px]">
      <header className="text-center">
        <h1 className="font-serif text-[2rem] leading-[1.2] text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-[13px] text-foreground/65">
          Don&rsquo;t have an account?{" "}
          <Link
            href="/signup"
            className="text-brand-indigo font-medium hover:underline cursor-pointer"
          >
            Sign up
          </Link>
        </p>
      </header>

      <form action={handleAction} className="mt-7 space-y-3" noValidate>
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
          autoComplete="current-password"
          required
          placeholder="Password"
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
          tone="ink"
          size="lg"
          fullWidth
          disabled={pending}
        >
          {pending ? "Signing in..." : "Log in"}
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
    </div>
  );
}
