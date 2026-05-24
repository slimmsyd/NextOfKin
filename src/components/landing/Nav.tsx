"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LandingCta } from "@/lib/landing-cta";

const items = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What we protect", href: "#what-we-protect" },
  { label: "For families", href: "#built-for-us" },
  { label: "FAQ", href: "#faq" },
];

function LogoMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-5 h-5 text-brand-indigo"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="9" cy="12" rx="4.5" ry="6.5" transform="rotate(-30 9 12)" />
      <ellipse cx="15" cy="12" rx="4.5" ry="6.5" transform="rotate(-30 15 12)" />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-5 h-5 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function Nav({ cta }: { cta: LandingCta }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Esc closes; lock body scroll while open; focus first link on open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => firstLinkRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open]);

  // Return focus to trigger after close
  useEffect(() => {
    if (!open) triggerRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <>
      <nav className="z-50 bg-white/95 backdrop-blur-md rounded-full pl-3 pr-2 py-2 shadow-[0_2px_20px_rgba(59,53,195,0.08)] flex items-center gap-1">
        <Link
          href="/"
          className="cursor-pointer flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-foreground"
        >
          <LogoMark />
          <span>NextOfKin</span>
        </Link>
        <ul className="hidden md:flex items-center">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="cursor-pointer px-4 py-2 text-sm text-foreground/75 hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {!cta.isAuthenticated ? (
          <Link
            href="/signin"
            className="cursor-pointer hidden md:inline-flex px-4 py-2 text-sm text-foreground/75 hover:text-foreground transition-colors"
          >
            Log in
          </Link>
        ) : null}
        <Link
          href={cta.href}
          className="cursor-pointer ml-1 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-violet text-white rounded-full hover:bg-brand-indigo transition-colors"
        >
          {cta.label}
          <span aria-hidden>&rarr;</span>
        </Link>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-sheet"
          className="cursor-pointer md:hidden ml-1 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-lavender-200 transition-colors"
        >
          <HamburgerIcon open={open} />
        </button>
      </nav>

      {/* Full-screen mobile sheet */}
      <div
        id="mobile-nav-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`md:hidden fixed inset-0 z-[100] bg-surface-lavender-100 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="cursor-pointer flex items-center gap-2 text-base font-semibold text-foreground"
          >
            <LogoMark />
            <span>NextOfKin</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="cursor-pointer inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-lavender-200 transition-colors"
          >
            <HamburgerIcon open />
          </button>
        </div>

        <nav className="px-6 mt-12 flex flex-col gap-1">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              ref={i === 0 ? firstLinkRef : undefined}
              onClick={() => setOpen(false)}
              className="cursor-pointer font-serif text-3xl text-foreground py-3 border-b border-surface-lavender-300 hover:text-brand-violet transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 px-6 pb-10 pt-6 border-t border-surface-lavender-300 bg-surface-lavender-100">
          {!cta.isAuthenticated ? (
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className="cursor-pointer block text-center py-3 text-sm font-medium text-foreground/75 hover:text-foreground transition-colors"
            >
              Log in
            </Link>
          ) : null}
          <Link
            href={cta.href}
            onClick={() => setOpen(false)}
            className="cursor-pointer mt-3 flex items-center justify-center gap-2 w-full py-4 bg-brand-violet text-white rounded-full font-medium hover:bg-brand-indigo transition-colors"
          >
            {cta.label}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </>
  );
}
