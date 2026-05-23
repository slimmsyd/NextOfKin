import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { ClosingTheGap } from "@/components/landing/ClosingTheGap";
import { WhatWeDo } from "@/components/landing/WhatWeDo";
import { BuiltForUs } from "@/components/landing/BuiltForUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhatWeProtect } from "@/components/landing/WhatWeProtect";
import { DontStopAtTheWill } from "@/components/landing/DontStopAtTheWill";
import { Faq } from "@/components/landing/Faq";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "NextOfKin — An estate operating system for the people you love",
  description:
    "NextOfKin is the continuous estate plan, built for Black American families. Gather your assets, name who you protect, and leave a plan your family can actually find and follow.",
  openGraph: {
    title: "NextOfKin — An estate operating system for the people you love",
    description:
      "The continuous estate plan, built for Black American families.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <div className="flex justify-center px-4 py-4 md:py-5">
        <Nav />
      </div>
      <main>
        <Hero />
        <TrustedBy />
        <ClosingTheGap />
        <WhatWeDo />
        <BuiltForUs />
        <HowItWorks />
        <WhatWeProtect />
        <DontStopAtTheWill />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
