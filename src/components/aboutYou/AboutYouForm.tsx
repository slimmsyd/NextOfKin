"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  DateInput,
  Repeater,
  Select,
  TextInput,
} from "@/components/forms";
import { AvaIndicator, VoiceNarrator, useVoice } from "@/components/voice";
import type { AutoSaveStatus } from "@/components/forms";
import { saveAboutYouAction } from "@/lib/setup/about-you";
import type {
  AboutYouData,
  AboutYouSpouse,
} from "@/lib/setup/about-you-types";
import {
  HOUSEHOLD_OPTIONS,
  MARITAL_STATUSES,
  SPOUSE_STATUSES,
  US_STATES,
} from "./states";

const SAVE_DEBOUNCE_MS = 800;
const NEXT_HREF = "/your-life";

const EMPTY_SPOUSE: AboutYouSpouse = { legalName: "", dob: "", state: "" };

function isValidDob(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const year = Number(iso.slice(0, 4));
  return year >= 1900 && year <= new Date().getFullYear();
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

type IndexItem = {
  n: number;
  label: string;
  done: boolean;
  na?: boolean;
};

function QuestionIndex({ items }: { items: IndexItem[] }) {
  return (
    <ol className="mt-8 space-y-3.5">
      {items.map((item) => (
        <li key={item.n} className="flex items-center gap-3">
          <span
            aria-hidden
            className={`font-serif italic text-[15px] leading-none w-4 ${
              item.done ? "text-brand-indigo" : "text-foreground/35"
            }`}
          >
            {item.n}
          </span>
          <span
            className={`flex-1 text-[14px] ${
              item.done ? "text-foreground" : "text-foreground/55"
            }`}
          >
            {item.label}
          </span>
          {item.na ? (
            <span aria-hidden className="text-foreground/30 text-sm">
              &mdash;
            </span>
          ) : item.done ? (
            <span
              aria-hidden
              className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-indigo text-white"
            >
              <CheckIcon />
            </span>
          ) : (
            <span
              aria-hidden
              className="h-4 w-4 rounded-full border border-surface-dusty/60"
            />
          )}
        </li>
      ))}
    </ol>
  );
}

export function AboutYouForm({
  initial,
  onStatusChange,
}: {
  initial: AboutYouData;
  onStatusChange?: (status: AutoSaveStatus) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<AboutYouData>(initial);
  const [navigating, startNavigate] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRenderRef = useRef(true);
  const onStatusRef = useRef(onStatusChange);

  // Voice waveform — observe shared state; VoiceNarrator triggers playback.
  const { currentScene, status: voiceStatus } = useVoice();
  const speaking = currentScene === "about-you" && voiceStatus === "playing";

  useEffect(() => {
    onStatusRef.current = onStatusChange;
  }, [onStatusChange]);

  // Debounced server autosave. Initial values came from the server, so the
  // first render is already persisted — skip saving it.
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    onStatusRef.current?.("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await saveAboutYouAction(form);
      if (res.ok) {
        onStatusRef.current?.("saved");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(
          () => onStatusRef.current?.("idle"),
          1800,
        );
      } else {
        onStatusRef.current?.("error");
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form]);

  const set = <K extends keyof AboutYouData>(key: K, value: AboutYouData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setSpouse = (patch: Partial<AboutYouSpouse>) =>
    setForm((f) => ({
      ...f,
      details: {
        ...f.details,
        spouse: { ...(f.details.spouse ?? EMPTY_SPOUSE), ...patch },
      },
    }));

  const spouseApplicable = SPOUSE_STATUSES.has(form.maritalStatus);
  const spouse = form.details.spouse;
  const dependents = form.details.dependents;

  // Completion flags for the index + counter.
  const flags = useMemo(() => {
    const legalName = form.legalName.trim().length > 1;
    const dob = isValidDob(form.dob);
    const state = form.state.length > 0;
    const marital = form.maritalStatus.length > 0;
    const spouseDone = spouseApplicable
      ? Boolean(spouse?.legalName.trim())
      : true;
    const dependentsDone = dependents.some((d) => d.name.trim().length > 0);
    const household = form.details.household.length > 0;
    return { legalName, dob, state, marital, spouseDone, dependentsDone, household };
  }, [form, spouse, dependents, spouseApplicable]);

  const indexItems: IndexItem[] = [
    { n: 1, label: "Legal name", done: flags.legalName },
    { n: 2, label: "Date of birth", done: flags.dob },
    { n: 3, label: "State of residence", done: flags.state },
    { n: 4, label: "Marital status", done: flags.marital },
    {
      n: 5,
      label: "Spouse or partner",
      done: flags.spouseDone,
      na: !spouseApplicable,
    },
    { n: 6, label: "Children & dependents", done: flags.dependentsDone },
    { n: 7, label: "Household", done: flags.household },
  ];
  const completedCount = indexItems.filter((i) => i.done).length;

  const canContinue =
    flags.legalName && flags.dob && flags.state && flags.marital;

  function handleContinue() {
    startNavigate(async () => {
      await saveAboutYouAction(form);
      router.push(NEXT_HREF);
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <div className="grid gap-10 md:grid-cols-[0.85fr_1.6fr] md:gap-14">
        {/* Left rail — editorial intro + question index */}
        <aside className="md:pt-2">
          <AvaIndicator speaking={speaking} className="mb-6" />
          <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] text-foreground leading-[1.06] tracking-tight">
            Let&rsquo;s{" "}
            <span className="italic text-brand-indigo">start</span> with you.
          </h1>
          <p className="mt-4 text-foreground/65 text-[15px] leading-[1.6]">
            Seven questions, about ten minutes. Facts that anchor everything
            else we build together. Skip what you don&rsquo;t know; I&rsquo;ll
            come back to it.
          </p>

          <VoiceNarrator scene="about-you" className="mt-4" />

          <QuestionIndex items={indexItems} />
        </aside>

        {/* Right column — the form */}
        <div className="space-y-6">
          <TextInput
            name="legal_name"
            label="Legal name (as on your ID)"
            required
            autoComplete="name"
            placeholder="First Middle Last"
            value={form.legalName}
            onChange={(e) => set("legalName", e.target.value)}
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
            value={form.maritalStatus}
            placeholder="Select"
            options={MARITAL_STATUSES}
            onChange={(e) => set("maritalStatus", e.target.value)}
          />

          {spouseApplicable ? (
            <div className="rounded-2xl border border-surface-lavender-300 bg-white/60 p-5 md:p-6 space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
                Spouse / Partner
              </p>
              <TextInput
                name="spouse_legal_name"
                label="Full legal name"
                autoComplete="off"
                placeholder="First Middle Last"
                value={spouse?.legalName ?? ""}
                onChange={(e) => setSpouse({ legalName: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DateInput
                  label="Date of birth"
                  name="spouse_dob"
                  value={spouse?.dob ?? ""}
                  onChange={(iso) => setSpouse({ dob: iso })}
                />
                <Select
                  name="spouse_state"
                  label="State of residence"
                  value={spouse?.state ?? ""}
                  placeholder="Select a state"
                  options={US_STATES}
                  onChange={(e) => setSpouse({ state: e.target.value })}
                />
              </div>
            </div>
          ) : null}

          <div>
            <label className="block text-sm text-foreground/70 mb-2">
              Children or dependents
            </label>
            <Repeater
              items={dependents}
              addLabel="Add a child or dependent"
              onAdd={() =>
                set("details", {
                  ...form.details,
                  dependents: [...dependents, { name: "" }],
                })
              }
              onRemove={(i) =>
                set("details", {
                  ...form.details,
                  dependents: dependents.filter((_, idx) => idx !== i),
                })
              }
              renderItem={(item, i) => (
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const next = [...dependents];
                    next[i] = { name: e.target.value };
                    set("details", { ...form.details, dependents: next });
                  }}
                  placeholder="Full name"
                  className="w-full h-9 px-2 text-[13px] bg-transparent text-foreground placeholder:text-foreground/40 outline-none"
                  aria-label={`Dependent ${i + 1} name`}
                />
              )}
            />
          </div>

          <Select
            name="household"
            label="Who else is in your household?"
            value={form.details.household}
            placeholder="Select"
            options={HOUSEHOLD_OPTIONS}
            onChange={(e) =>
              set("details", { ...form.details, household: e.target.value })
            }
          />

          <div className="pt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-foreground/55">
              {completedCount} of 7 complete
            </p>
            <Button
              type="button"
              variant="primary"
              disabled={!canContinue || navigating}
              onClick={handleContinue}
            >
              Save &amp; continue
              <span aria-hidden>&rarr;</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
