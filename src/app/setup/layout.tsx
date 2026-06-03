import type { Metadata } from "next";
import { SetupIntakeShell } from "@/components/setup/SetupIntakeShell";

export const metadata: Metadata = {
  title: "Welcome · NextOfKin",
  description: "Phase 1 of your NextOfKin intake. A warm welcome before we begin.",
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SetupIntakeShell>{children}</SetupIntakeShell>;
}
