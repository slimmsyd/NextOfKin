import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About you · NextOfKin",
  description:
    "Phase 2 of your NextOfKin intake. A few quick questions about you.",
};

export default function AboutYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
