"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { validateAndApply, type ToolCall, type ToolResult } from "@/lib/yourLife/tools";

/**
 * Single gate for both model-emitted and UI-emitted tool calls.
 * The right pane writes through this; the chat route writes through this;
 * the audit log gets a unified record.
 */
export async function applyToolCall(call: ToolCall): Promise<ToolResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { ok: false, name: call.name, error: "Not authenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: auth.user.id },
    select: { id: true, stateCode: true },
  });

  if (!user) {
    return { ok: false, name: call.name, error: "User profile not found" };
  }

  const result = await validateAndApply(call, {
    prisma,
    userId: user.id,
    stateCode: user.stateCode,
  });

  if (result.ok) {
    revalidatePath("/your-life/real-estate");
  }

  return result;
}
