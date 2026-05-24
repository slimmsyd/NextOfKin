import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in - NextOfKin",
  description: "Sign in to continue your NextOfKin plan.",
};

export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
