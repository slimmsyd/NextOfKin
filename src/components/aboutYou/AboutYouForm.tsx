"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  DateInput,
  LinkButton,
  Repeater,
  Select,
  TextInput,
} from "@/components/forms";
import { VoiceNarrator } from "@/components/voice";
import type { AutoSaveStatus } from "@/components/forms";
import { MARITAL_STATUSES, US_STATES } from "./states";

const STORAGE_KEY = "nok_about_you";
const SAVE_DEBOUNCE_MS = 800;

type Dependent = { name: string };

type AboutYou = {
  legal_name: string;
  dob: string; // ISO YYYY-MM-DD
  state: string;
  marital_status: string;
  dependents: Dependent[];
};

const EMPTY: AboutYou = {
  legal_name: "",
  dob: "",
  state: "",
  marital_status: "",
  dependents: [],
};

function isValidDob(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const year = Number(iso.slice(0, 4));
  return year >= 1900 && year <= new Date().getFullYear();
}

export function AboutYouForm({
  onStatusChange,
}: {
  onStatusChange?: (status: AutoSaveStatus) => void;
}) {
  // Read from localStorage synchronously in the lazy initializer.
  // On the server this returns EMPTY (no window), and on the client first
  // render it returns the stored value. We delay applying the stored value
  // to the rendered fields until after mount via `hydrated` to avoid a
  // hydration mismatch.
  const initialStored = useState<AboutYou>(() => {
    if (typeof window === "undefined") return EMPTY;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return EMPTY;
      return { ...EMPTY, ...(JSON.parse(raw) as Partial<AboutYou>) };
    } catch {
      return EMPTY;
    }
  })[0];

  const [form, setForm] = useState<AboutYou>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onStatusRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusRef.current = onStatusChange;
  }, [onStatusChange]);

  // Apply the stored value after mount so we never differ from the SSR HTML
  // on first paint. This setState is the intentional one-time hydration —
  // the lint rule flags it as "synchronous setState in effect", which is
  // exactly what we want here.
  useEffect(() => {
    if (initialStored !== EMPTY) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialStored);
      onStatusRef.current?.("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(
        () => onStatusRef.current?.("idle"),
        1500,
      );
    }
    setHydrated(true);
    // initialStored is captured from the lazy initializer and never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-save.
  useEffect(() => {
    if (!hydrated) return;
    onStatusRef.current?.("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        onStatusRef.current?.("saved");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(
          () => onStatusRef.current?.("idle"),
          1800,
        );
      } catch {
        onStatusRef.current?.("error");
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form, hydrated]);

  const canContinue = useMemo(() => {
    return (
      form.legal_name.trim().length > 1 &&
      isValidDob(form.dob) &&
      form.state.length > 0 &&
      form.marital_status.length > 0
    );
  }, [form]);

  const set = <K extends keyof AboutYou>(key: K, value: AboutYou[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="w-full max-w-2xl mx-auto px-6 md:px-10 py-12 md:py-20">
      <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-[1.05] tracking-tight">
        Let&rsquo;s{" "}
        <span className="italic text-brand-indigo">start</span> with you.
      </h1>
      <p className="mt-3 md:mt-4 text-foreground/70 text-base md:text-[17px]">
        Seven quick questions. About ten minutes.
      </p>

      <VoiceNarrator scene="about-you" className="mt-4" />

      <div className="mt-10 md:mt-12 space-y-6">
        <TextInput
          name="legal_name"
          label="Legal name (as on your ID)"
          required
          autoComplete="name"
          placeholder="First Middle Last"
          value={form.legal_name}
          onChange={(e) => set("legal_name", e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateInput
            label="Date of birth"
            required
            name="dob"
            value={form.dob}
            onChange={(iso) => set("dob", iso)}
          />
          <Select
            name="state"
            label="State of residence"
            required
            value={form.state}
            placeholder="Select a state"
            options={US_STATES}
            onChange={(e) => set("state", e.target.value)}
          />
        </div>

        <Select
          name="marital_status"
          label="Marital status"
          required
          value={form.marital_status}
          placeholder="Select"
          options={MARITAL_STATUSES}
          onChange={(e) => set("marital_status", e.target.value)}
        />

        <div>
          <label className="block text-sm text-foreground/70 mb-2">
            Children or dependents
          </label>
          <Repeater
            items={form.dependents}
            addLabel="Add a child or dependent"
            onAdd={() =>
              set("dependents", [...form.dependents, { name: "" }])
            }
            onRemove={(i) =>
              set(
                "dependents",
                form.dependents.filter((_, idx) => idx !== i),
              )
            }
            renderItem={(item, i) => (
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const next = [...form.dependents];
                  next[i] = { name: e.target.value };
                  set("dependents", next);
                }}
                placeholder="Full name"
                className="w-full h-9 px-2 text-[13px] bg-transparent text-foreground placeholder:text-foreground/40 outline-none"
                aria-label={`Dependent ${i + 1} name`}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-12 md:mt-14 flex items-center justify-between">
        <LinkButton href="/setup/protect" variant="secondary">
          Back
        </LinkButton>
        <Button
          type="button"
          variant="primary"
          disabled={!canContinue}
          onClick={() => {
            /* placeholder — next phase not built yet */
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
