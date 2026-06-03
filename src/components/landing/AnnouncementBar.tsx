import { WaitlistTriggerLink } from "@/components/waitlist/WaitlistTriggerLink";

export function AnnouncementBar() {
  return (
    <div className="bg-surface-deep text-white py-2.5 text-center text-sm">
      <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4">
        <span className="text-brand-violet font-medium">Now available</span>
        <span className="text-white/90">
          Welcoming North Carolina families
        </span>
        <span aria-hidden className="text-white/30">
          &middot;
        </span>
        <span className="text-white/80">
          Not ready yet?{" "}
          <WaitlistTriggerLink tone="inherit" className="text-white">
            Join the waitlist
          </WaitlistTriggerLink>
        </span>
      </span>
    </div>
  );
}
