import Link from "next/link";

const items = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What we protect", href: "#what-we-protect" },
  { label: "Pricing", href: "#pricing" },
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

export function Nav() {
  return (
    <nav className="z-50 bg-white/95 backdrop-blur-md rounded-full pl-3 pr-2 py-2 shadow-[0_2px_20px_rgba(59,53,195,0.08)] flex items-center gap-1">
      <Link
        href="/"
        className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-foreground"
      >
        <LogoMark />
        <span>NextOfKin</span>
      </Link>
      <ul className="hidden md:flex items-center">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="px-4 py-2 text-sm text-foreground/75 hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="#login"
        className="hidden md:inline-flex px-4 py-2 text-sm text-foreground/75 hover:text-foreground transition-colors"
      >
        Log in
      </Link>
      <Link
        href="#cta"
        className="ml-1 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-violet text-white rounded-full hover:bg-brand-indigo transition-colors"
      >
        Start your plan
        <span aria-hidden>&rarr;</span>
      </Link>
    </nav>
  );
}
