"use client";

import { useState } from "react";
import { AutoSaveBadge } from "@/components/forms";
import type { AutoSaveStatus } from "@/components/forms";
import { SetupIntakeShell } from "@/components/setup/SetupIntakeShell";
import type { AboutYouData } from "@/lib/setup/about-you-types";
import { AboutYouForm } from "./AboutYouForm";

export function AboutYouPage({ initial }: { initial: AboutYouData }) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");

  return (
    <SetupIntakeShell rightSlot={<AutoSaveBadge status={status} />}>
      <AboutYouForm initial={initial} onStatusChange={setStatus} />
    </SetupIntakeShell>
  );
}
