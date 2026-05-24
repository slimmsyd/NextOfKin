import type { ReactNode } from "react";

export function SignupSplitLayout({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      <section
        aria-label="NextOfKin"
        className="relative w-full md:w-1/2 min-h-[420px] md:min-h-screen"
      >
        {left}
      </section>
      <section
        aria-label="Create an account"
        className="w-full md:w-1/2 bg-white flex items-center justify-center px-6 py-12 md:px-12 lg:px-16 md:py-16"
      >
        {right}
      </section>
    </main>
  );
}
