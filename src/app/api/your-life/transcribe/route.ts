import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/yourLife/stt";

// Transcribes a recorded intake answer. Record-then-transcribe: the client POSTs the
// audio Blob as multipart/form-data; we return the plain text for the composer.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const entry = (await req.formData()).get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No audio provided" }, { status: 400 });
  }

  try {
    const text = await transcribeAudio(file);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("STT transcription failed:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
