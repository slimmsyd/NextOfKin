"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 80;
const PASSWORD_MIN = 8;

export type SignupResult = { ok: true } | { ok: false; error: string };

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!firstName || firstName.length > NAME_MAX || !lastName || lastName.length > NAME_MAX) {
    return { ok: false, error: "Please enter your first and last name." };
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < PASSWORD_MIN) {
    return { ok: false, error: `Password must be at least ${PASSWORD_MIN} characters.` };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        state_code: "NC",
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  redirect("/start");
}
