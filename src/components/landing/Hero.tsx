import Image from "next/image";
import Link from "next/link";

const trustItems = [
  {
    label: "About an hour to start",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <path
          d="M3 8.5l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "NC attorney-reviewed",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <path
          d="M8 1.5L2.5 3.5v4c0 3 2.5 5.5 5.5 7 3-1.5 5.5-4 5.5-7v-4L8 1.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Cancel anytime",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 5v3.5l2 1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

type Folder = {
  src: string;
  alt: string;
  // Each folder PNG renders at its natural aspect ratio. Use `lift` to nudge
  // it vertically for a piano-key effect when there are 3+ folders.
  lift?: number; // px, positive = sits lower
};

// Add more folder PNGs here as they're produced. The row centers any number
// of folders and aligns them to the bottom.
const folders: Folder[] = [
  {
    src: "/folders/folder-1.png",
    alt: "Family photograph kept in a NextOfKin folder",
  },
  {
    src: "/folders/folder-2.png",
    alt: "Family photograph kept in a NextOfKin folder",
  },
];

function FolderCard({ folder }: { folder: Folder }) {
  return (
    <div
      className="relative w-full drop-shadow-[0_28px_40px_rgba(10,10,15,0.45)]"
      style={folder.lift ? { transform: `translateY(${folder.lift}px)` } : undefined}
    >
      <Image
        src={folder.src}
        alt={folder.alt}
        width={600}
        height={800}
        priority
        sizes="(max-width: 768px) 45vw, 340px"
        className="w-full h-auto object-contain select-none pointer-events-none"
      />
    </div>
  );
}

export function Hero() {
  return (
    <section className="px-4 md:px-6 pt-6">
      <div className="max-w-[1400px] mx-auto">
        {/* === Hero card === */}
        <div
          className="relative rounded-3xl pt-32 md:pt-40 lg:pt-44 pb-[300px] md:pb-[360px] lg:pb-[420px] text-white overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, #5A4FE0 0%, #3B35C3 35%, #2A2599 80%, #1F1A7A 100%)",
          }}
        >
          {/* subtle grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          {/* warm violet glow at top */}
          <div
            aria-hidden
            className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, rgba(155,131,255,0.5) 0%, transparent 70%)",
            }}
          />
          {/* soft vignette at bottom to settle the folders */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-72 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(20,15,90,0.4) 100%)",
            }}
          />

          {/* === Centered content === */}
          <div className="relative z-10 px-6 md:px-10 lg:px-16 text-center max-w-5xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 text-xs md:text-sm text-white/95">
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              />
              Available now in North Carolina · Built for our families
            </span>

            <h1 className="mt-10 font-semibold tracking-tight leading-[0.98] text-5xl md:text-7xl lg:text-[5.75rem]">
              Make sure what you built
              <br />
              gets to the{" "}
              <span className="font-serif font-normal italic text-[#F4E8C1]">
                people you love
              </span>
              <span className="text-white">.</span>
            </h1>

            <p className="mt-10 text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              NextOfKin is the legacy planning service built for our families.
              Organize your life, prepare the documents your family will need,
              and create a plan for the day they need it most.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <Link
                href="/signup"
                className="cursor-pointer inline-flex items-center gap-2 px-7 py-3.5 bg-white text-foreground rounded-full font-medium shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-surface-lavender-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-brand-indigo"
              >
                Start your plan
                <span aria-hidden>&rarr;</span>
              </Link>
              <Link
                href="#how-it-works"
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-3.5 text-white/90 hover:text-white transition-colors duration-200"
              >
                See how it works
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs md:text-sm text-white/55">
              {trustItems.map((t) => (
                <li key={t.label} className="flex items-center gap-2">
                  <span className="text-white/45">{t.icon}</span>
                  {t.label}
                </li>
              ))}
            </ul>
          </div>

          {/* === Folders rising from below the card edge (bottom clipped by overflow-hidden) === */}
          <div className="absolute inset-x-0 z-20 px-4 md:px-8 lg:px-12 bottom-[-80px] md:bottom-[-120px] lg:bottom-[-160px]">
            <div className="flex justify-center items-end gap-4 md:gap-6 lg:gap-8 max-w-[1300px] mx-auto">
              {folders.map((folder, i) => (
                <div
                  key={i}
                  className="flex-1 max-w-[260px] md:max-w-[320px] lg:max-w-[380px]"
                >
                  <FolderCard folder={folder} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
