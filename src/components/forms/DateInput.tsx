"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FieldLabel } from "./FieldLabel";

type DateInputProps = {
  label?: string;
  required?: boolean;
  /** ISO date string YYYY-MM-DD or empty. */
  value: string;
  onChange: (iso: string) => void;
  error?: string | null;
  name?: string;
  fieldClassName?: string;
};

function parts(iso: string): { mm: string; dd: string; yyyy: string } {
  if (!iso) return { mm: "", dd: "", yyyy: "" };
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { mm: "", dd: "", yyyy: "" };
  return { yyyy: m[1], mm: m[2], dd: m[3] };
}

function joinIso(mm: string, dd: string, yyyy: string): string {
  if (mm.length === 2 && dd.length === 2 && yyyy.length === 4) {
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}

export function DateInput({
  label,
  required,
  value,
  onChange,
  error,
  name,
  fieldClassName,
}: DateInputProps) {
  const baseId = useId();
  const mmRef = useRef<HTMLInputElement | null>(null);
  const ddRef = useRef<HTMLInputElement | null>(null);
  const yyRef = useRef<HTMLInputElement | null>(null);

  // Local state for each part so partial typing isn't clobbered when the
  // parent's ISO value is empty (which it is until all three parts are
  // complete). We sync DOWN from parent only when parent supplies a fully
  // valid ISO — e.g. on hydration from localStorage.
  const initial = parts(value);
  const [mm, setMm] = useState(initial.mm);
  const [dd, setDd] = useState(initial.dd);
  const [yyyy, setYyyy] = useState(initial.yyyy);

  // Intentional sync from a valid parent ISO (e.g. on hydration from
  // localStorage). The deps are intentionally narrowed to `value` so we
  // don't loop on our own setState calls; we string-compare to skip
  // redundant updates.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!value) return;
    const p = parts(value);
    if (p.mm !== mm) setMm(p.mm);
    if (p.dd !== dd) setDd(p.dd);
    if (p.yyyy !== yyyy) setYyyy(p.yyyy);
  }, [value]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handle = (
    field: "mm" | "dd" | "yyyy",
    raw: string,
    maxLen: number,
    nextRef: React.RefObject<HTMLInputElement | null> | null,
  ) => {
    const digits = raw.replace(/\D/g, "").slice(0, maxLen);
    const next = {
      mm: field === "mm" ? digits : mm,
      dd: field === "dd" ? digits : dd,
      yyyy: field === "yyyy" ? digits : yyyy,
    };
    if (field === "mm") setMm(digits);
    if (field === "dd") setDd(digits);
    if (field === "yyyy") setYyyy(digits);
    onChange(joinIso(next.mm, next.dd, next.yyyy));
    if (digits.length === maxLen && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  return (
    <div className={fieldClassName}>
      {label ? (
        <FieldLabel htmlFor={`${baseId}-mm`} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <div
        className={[
          "flex items-center gap-1 h-[50px] px-4 bg-white rounded-lg",
          "border border-[#DFDFE4]",
          "focus-within:border-foreground/55 transition-colors",
          error ? "border-[#B23B3B]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          ref={mmRef}
          id={`${baseId}-mm`}
          name={name ? `${name}_mm` : undefined}
          inputMode="numeric"
          autoComplete="off"
          placeholder="MM"
          value={mm}
          maxLength={2}
          onChange={(e) => handle("mm", e.target.value, 2, ddRef)}
          className="w-[2.5ch] text-[13px] bg-transparent text-foreground placeholder:text-foreground/40 outline-none tabular-nums"
        />
        <span aria-hidden className="text-foreground/30 text-[13px]">
          /
        </span>
        <input
          ref={ddRef}
          id={`${baseId}-dd`}
          name={name ? `${name}_dd` : undefined}
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD"
          value={dd}
          maxLength={2}
          onChange={(e) => handle("dd", e.target.value, 2, yyRef)}
          className="w-[2.5ch] text-[13px] bg-transparent text-foreground placeholder:text-foreground/40 outline-none tabular-nums"
        />
        <span aria-hidden className="text-foreground/30 text-[13px]">
          /
        </span>
        <input
          ref={yyRef}
          id={`${baseId}-yyyy`}
          name={name ? `${name}_yyyy` : undefined}
          inputMode="numeric"
          autoComplete="off"
          placeholder="YYYY"
          value={yyyy}
          maxLength={4}
          onChange={(e) => handle("yyyy", e.target.value, 4, null)}
          className="w-[4.5ch] text-[13px] bg-transparent text-foreground placeholder:text-foreground/40 outline-none tabular-nums"
        />
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-[12px] text-[#B23B3B]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
