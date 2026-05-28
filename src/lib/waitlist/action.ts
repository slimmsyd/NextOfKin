"use server";

import { Prisma, WaitlistAgeBracket, WaitlistGender } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 80;
const PHONE_RE = /^[+0-9 ().\-]{7,20}$/;

export type WaitlistResult = { ok: true } | { ok: false; error: string };

function parseGender(value: string): WaitlistGender | null {
  if (!value) return null;
  return (Object.values(WaitlistGender) as string[]).includes(value)
    ? (value as WaitlistGender)
    : null;
}

function parseAgeBracket(value: string): WaitlistAgeBracket | null {
  if (!value) return null;
  return (Object.values(WaitlistAgeBracket) as string[]).includes(value)
    ? (value as WaitlistAgeBracket)
    : null;
}

export async function joinWaitlistAction(
  formData: FormData,
): Promise<WaitlistResult> {
  // Honeypot. Real users never fill this field — bots usually do. Pretend
  // success so the bot moves on.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) return { ok: true };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const firstNameRaw = String(formData.get("first_name") ?? "").trim();
  const firstName =
    firstNameRaw && firstNameRaw.length <= NAME_MAX ? firstNameRaw : null;

  const phoneRaw = String(formData.get("phone") ?? "").trim();
  if (phoneRaw && !PHONE_RE.test(phoneRaw)) {
    return { ok: false, error: "That phone number doesn't look right." };
  }
  const phone = phoneRaw || null;

  const gender = parseGender(String(formData.get("gender") ?? "").trim());
  const ageBracket = parseAgeBracket(
    String(formData.get("age_bracket") ?? "").trim(),
  );

  const sourceRaw = String(formData.get("source") ?? "").trim();
  const source = sourceRaw && sourceRaw.length <= 80 ? sourceRaw : "landing";

  try {
    await prisma.waitlist.create({
      data: { email, firstName, phone, gender, ageBracket, source },
    });
    return { ok: true };
  } catch (err) {
    // Already on the list. Idempotent + friendly: treat as success.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { ok: true };
    }
    console.error("Waitlist insert failed:", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
