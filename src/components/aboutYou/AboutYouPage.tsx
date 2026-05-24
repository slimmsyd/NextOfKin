"use client";

import { useState } from "react";
import { PhaseHeader } from "@/components/setup/PhaseHeader";
import { AutoSaveBadge } from "@/components/forms";
import type { AutoSaveStatus } from "@/components/forms";
import { AboutYouForm } from "./AboutYouForm";

export function AboutYouPage() {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");

  return (
    <main className="min-h-screen bg-surface-lavender-100 flex flex-col">
      <PhaseHeader
        phase={2}
        phaseLabel="About you"
        rightSlot={<AutoSaveBadge status={status} />}
        showProgress={false}
      />
      <div className="flex-1 flex items-start md:items-center">
        <AboutYouForm onStatusChange={setStatus} />
      </div>
    </main>
  );
}
