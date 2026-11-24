// EL FASL — Visit tracking API (real visitor counting for the admin panel).
// The client sends its random visitor id (stored in localStorage, never a
// login or personal data) once per browser session; the server upserts one
// row per visitor per day, so repeat page views add nothing. Works for
// anonymous landing-page visitors too (anon may only INSERT into site_visits).
import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  visitorId: z.string().regex(/^[0-9a-f-]{36}$/i),
  path: z
    .string()
    .max(200)
    .refine((p) => p.startsWith("/")),
});

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: false, reason: "demo" });
    const body = bodySchema.parse(await req.json());
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ ok: false, reason: "no-client" });
    const day = new Date().toISOString().slice(0, 10);
    // Plain INSERT (not upsert): an UPSERT would also need UPDATE + SELECT
    // privileges for the anon role. A unique-violation (23505) just means
    // this visitor was already counted today — that is success, not an error.
    const { error } = await supabase
      .from("site_visits")
      .insert({ visitor_id: body.visitorId, path: body.path, day });
    if (error) {
      if ((error as { code?: string }).code === "23505") {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      return NextResponse.json({ ok: false, reason: "db" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
