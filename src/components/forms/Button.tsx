import Link from "next/link";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";
type Tone = "indigo" | "ink";

type Common = {
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  fullWidth?: boolean;
  children: ReactNode;
};

type ButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

type LinkButtonProps = Common & {
  href: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

function classes({
  variant = "primary",
  size = "md",
  tone = "indigo",
  fullWidth = false,
  disabled = false,
  extra = "",
}: {
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  fullWidth?: boolean;
  disabled?: boolean;
  extra?: string;
}) {
  const sizing =
    size === "lg"
      ? "h-[50px] px-8 text-[14px]"
      : "h-[44px] px-6 text-sm";

  const width = fullWidth ? "w-full" : "";

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  let variantCls = "";
  if (variant === "primary") {
    if (tone === "ink") {
      variantCls =
        "bg-foreground text-white hover:bg-foreground/90 focus-visible:ring-foreground";
    } else {
      variantCls =
        "bg-brand-indigo text-white hover:bg-brand-violet focus-visible:ring-brand-indigo";
    }
  } else {
    variantCls =
      "bg-transparent border border-[#DFDFE4] text-foreground hover:bg-foreground/5 focus-visible:ring-brand-indigo";
  }

  const disabledCls = disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "cursor-pointer";

  return [base, sizing, width, variantCls, disabledCls, extra]
    .filter(Boolean)
    .join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    tone,
    fullWidth,
    className,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      aria-disabled={disabled}
      className={classes({
        variant,
        size,
        tone,
        fullWidth,
        disabled: !!disabled,
        extra: className ?? "",
      })}
      {...rest}
    >
      {children}
    </button>
  );
});

export function LinkButton({
  href,
  variant,
  size,
  tone,
  fullWidth,
  disabled,
  onClick,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      href={disabled ? "#" : href}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      className={classes({
        variant,
        size,
        tone,
        fullWidth,
        disabled: !!disabled,
        extra: className ?? "",
      })}
      {...rest}
    >
      {children}
    </Link>
  );
}
