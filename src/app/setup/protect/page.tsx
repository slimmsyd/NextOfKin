import { PhaseHeader } from "@/components/setup/PhaseHeader";
import { SetupProtect } from "@/components/setup/SetupProtect";

export const metadata = {
  title: "Protect your account · NextOfKin",
};

export default function SetupProtectPage() {
  return (
    <main className="min-h-screen bg-surface-lavender-100 flex flex-col">
      <PhaseHeader
        phase={1}
        phaseLabel="Welcome"
        step={2}
        stepCount={3}
      />
      <div className="flex-1 flex items-start md:items-center">
        <SetupProtect />
      </div>
    </main>
  );
}
