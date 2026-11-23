// EL FASL — API: Ideas
// GET: list seed ideas. POST: create an idea (zod-validated, server auth-checked).
// Auth is decided server-side from the demo cookie or a Supabase session cookie.
// Never trusts any role sent by the client. Persistence is in-memory demo echo
// until Supabase tables are wired in.
import { NextResponse } from "next/server";
import { getServerRole } from "@/lib/community-auth";
import { SEED_IDEAS, ideaSchema, type Idea } from "@/lib/community-data";


export async function GET() {
  return NextResponse.json({ ideas: SEED_IDEAS });
}

export async function POST(req: Request) {
  const role = await getServerRole();
  if (!role) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = ideaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const idea: Idea = {
    id: `idea-${Date.now()}`,
    title: data.title,
    description: data.description,
    subject: data.subject,
    stage: data.stage,
    timeMinutes: data.timeMinutes,
    tools: data.tools ?? "",
    steps: data.steps.split("\n").map((s) => s.trim()).filter(Boolean),
    likes: 0,
    commentsCount: 0,
    author: "أنت",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  return NextResponse.json({ idea, xpAwarded: 20 }, { status: 201 });
}
