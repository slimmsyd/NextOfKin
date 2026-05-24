import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { FieldLabel } from "./FieldLabel";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  required?: boolean;
  error?: string | null;
  fieldClassName?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
};

function ChevronDown() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4 text-foreground/50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id,
    name,
    label,
    required,
    error,
    className,
    fieldClassName,
    placeholder,
    options,
    value,
    ...rest
  },
  ref,
) {
  const selectId = id ?? name;
  return (
    <div className={fieldClassName}>
      {label ? (
        <FieldLabel htmlFor={selectId} required={required}>
          {label}
        </FieldLabel>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={[
            "w-full h-[50px] pl-4 pr-10 text-[13px] bg-white rounded-lg appearance-none",
            "border border-[#DFDFE4] text-foreground",
            "focus:outline-none focus:border-foreground/55 transition-colors",
            value ? "text-foreground" : "text-foreground/50",
            error ? "border-[#B23B3B]" : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown />
        </span>
      </div>
      {error ? (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="mt-1.5 text-[12px] text-[#B23B3B]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});
