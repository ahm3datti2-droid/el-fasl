// EL FASL — API: Anonymous posts (فضفضة مدرس)
// GET: list seed posts. POST: create a post (zod-validated, server auth-checked).
// Anonymous posts never expose the author's identity to other users; the server
// keeps authorship for moderation only (Supabase RLS enforces this in production).
import { NextResponse } from "next/server";
import { getServerRole } from "@/lib/community-auth";
import { SEED_POSTS, anonymousPostSchema, type AnonymousPost } from "@/lib/community-data";


export async function GET() {
  return NextResponse.json({ posts: SEED_POSTS });
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

  const parsed = anonymousPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const post: AnonymousPost = {
    id: `post-${Date.now()}`,
    type: data.type,
    content: data.content,
    anonymous: data.anonymous,
    authorLabel: data.anonymous ? "مدرس مجهول" : "أنت",
    likes: 0,
    votesFor: 0,
    votesAgainst: 0,
    comments: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };

  return NextResponse.json({ post }, { status: 201 });
}
