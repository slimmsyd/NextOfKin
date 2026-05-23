import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="bg-surface-deep text-white py-2.5 text-center text-sm">
      <Link
        href="#cta"
        className="cursor-pointer inline-flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <span className="text-brand-violet font-medium">Now available</span>
        <span className="text-white/90">
          Welcoming North Carolina families
        </span>
        <span aria-hidden className="text-white/60">
          &rarr;
        </span>
      </Link>
    </div>
  );
}
