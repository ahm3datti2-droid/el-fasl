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
    const { error } = await supabase
      .from("site_visits")
      .upsert(
        { visitor_id: body.visitorId, path: body.path, day },
        { onConflict: "visitor_id,day" },
      );
    if (error) return NextResponse.json({ ok: false, reason: "db" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
