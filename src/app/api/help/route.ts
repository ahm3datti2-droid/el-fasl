// EL FASL — API: Help requests (مدرس يساعد مدرس)
// GET: list seed requests. POST: create a request (zod-validated, server auth-checked).
import { NextResponse } from "next/server";
import { getServerRole } from "@/lib/community-auth";
import { SEED_HELP, helpRequestSchema, type HelpRequest } from "@/lib/community-data";


export async function GET() {
  return NextResponse.json({ requests: SEED_HELP });
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

  const parsed = helpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const request: HelpRequest = {
    id: `help-${Date.now()}`,
    title: data.title,
    description: data.description,
    type: data.type,
    specialization: data.specialization,
    stage: data.stage,
    status: "مفتوح",
    author: "أنت",
    createdAt: new Date().toISOString().slice(0, 10),
    responses: [],
  };

  return NextResponse.json({ request }, { status: 201 });
}
