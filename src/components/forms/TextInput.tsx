import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { FieldLabel } from "./FieldLabel";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  required?: boolean;
  error?: string | null;
  fieldClassName?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      id,
      name,
      label,
      required,
      error,
      className,
      fieldClassName,
      ...rest
    },
    ref,
  ) {
    const inputId = id ?? name;
    return (
      <div className={fieldClassName}>
        {label ? (
          <FieldLabel htmlFor={inputId} required={required}>
            {label}
          </FieldLabel>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={[
            "w-full h-[50px] px-4 text-[13px] bg-white rounded-lg",
            "border border-[#DFDFE4] text-foreground",
            "placeholder:text-foreground/50",
            "focus:outline-none focus:border-foreground/55 transition-colors",
            error ? "border-[#B23B3B]" : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 text-[12px] text-[#B23B3B]"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
