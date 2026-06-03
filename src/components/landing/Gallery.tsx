"use client";

import Image from "next/image";
import Marquee from "react-fast-marquee";

type GalleryItem = {
  // Drop a B&W photo into /public/gallery/ and set src to enable the image.
  // Leave undefined to keep the dark placeholder.
  src?: string;
  alt: string;
};

const items: GalleryItem[] = [
  { alt: "Family portrait archive, North Carolina, 1972" },
  { alt: "Newborn welcomed home, North Carolina, 2024" },
  { alt: "Sunday service, North Carolina, archive" },
  { alt: "Funeral procession, New York, 1989" },
  { alt: "Hands at the table, archive" },
  { alt: "Heirloom Bible, archive" },
];

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <article
      className="relative aspect-[3/4] w-[200px] md:w-[240px] lg:w-[280px] rounded-md overflow-hidden bg-[#1A1A22] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.55)]"
      style={
        item.src
          ? undefined
          : {
              background:
                "linear-gradient(160deg, #2A2630 0%, #15131C 100%)",
            }
      }
    >
      {item.src ? (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 768px) 200px, 280px"
          className="object-cover grayscale"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-white/[0.06]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            aria-hidden
          >
            <path d="M12 3l9 9-9 9-9-9 9-9z" />
          </svg>
        </div>
      )}
    </article>
  );
}

export function Gallery() {
  return (
    <Marquee speed={40} pauseOnHover autoFill>
      {items.map((item, i) => (
        <div key={i} className="mr-3 md:mr-4 lg:mr-5">
          <GalleryCard item={item} />
        </div>
      ))}
    </Marquee>
  );
}
