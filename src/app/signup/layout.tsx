import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account · NextOfKin",
  description:
    "Make sure what you built gets to the people you love. Start your NextOfKin plan.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
