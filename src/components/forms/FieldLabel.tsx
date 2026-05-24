import type { ReactNode } from "react";

export function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm text-foreground/70 mb-2"
    >
      {children}
      {required ? (
        <span aria-hidden className="text-brand-indigo ml-0.5">
          *
        </span>
      ) : null}
    </label>
  );
}
