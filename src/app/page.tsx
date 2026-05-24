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
import { getLandingCta } from "@/lib/landing-cta";




export const metadata: Metadata = {
  title: "The legacy plan built for our families",
  description:
    "NextOfKin is the continuous estate plan, built for Black American families. Gather your assets, name who you protect, and leave a plan your family can actually find and follow.",
  openGraph: {
    title: "The legacy plan built for our families",
    description:
      "The continuous estate plan, built for Black American families.",
    type: "website",
  },
};

export default async function HomePage() {
  const cta = await getLandingCta();
  return (
    <>
      <AnnouncementBar />
      <main>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 z-50 flex justify-center px-4 py-4 md:py-5">
            <Nav cta={cta} />
          </div>
          <Hero cta={cta} />
        </div>
        <TrustedBy />
        <ClosingTheGap />
        <WhatWeDo />
        <BuiltForUs />
        <HowItWorks cta={cta} />
        <WhatWeProtect />
        <DontStopAtTheWill />
        <Faq />
        <ClosingCta cta={cta} />
      </main>
      <Footer />
    </>
  );
}
