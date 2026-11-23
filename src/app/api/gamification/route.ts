import { NextResponse } from "next/server";
import { z } from "zod";
import { BADGES, LEVELS, levelForXp } from "@/lib/features-data";

// EL FASL — Gamification API
// Server-side XP validation: the client can only request an allowed action;
// the server decides the amount and enforces a per-action cap.
// NOTE: This is the Phase 2 demo implementation. It returns the validated
// award and the resulting demo totals. Persisting to Supabase (profiles /
// points_transactions) is wired in Phase 4 when the auth/session layer lands:
// the route will then read the session server-side and write the transaction
// under RLS instead of trusting any client-supplied totals.

const ACTION_XP: Record<string, number> = {
  complete_challenge: 20,
  answer_quiz_correct: 15,
  answer_quiz_wrong: 5,
  complete_scenario: 30,
  save_flip_idea: 5,
  complete_simulator_scenario: 30,
  use_classroom_tool: 5,
};

const awardSchema = z.object({
  action: z.enum([
    "complete_challenge",
    "answer_quiz_correct",
    "answer_quiz_wrong",
    "complete_scenario",
    "save_flip_idea",
    "complete_simulator_scenario",
    "use_classroom_tool",
  ]),
  // The client may suggest a reference (e.g. scenario id) but never an amount.
  refId: z.string().max(64).optional(),
});

const DEMO_BASE_XP = 120;

export async function GET() {
  const xp = DEMO_BASE_XP;
  const level = levelForXp(xp);
  const nextLevel = LEVELS.find((l) => l.minXp > xp) ?? null;
  return NextResponse.json({
    xp,
    level: level.name,
    levelId: level.id,
    nextLevel: nextLevel ? { name: nextLevel.name, minXp: nextLevel.minXp } : null,
    xpToNextLevel: nextLevel ? nextLevel.minXp - xp : 0,
    streakDays: 3,
    badges: BADGES.slice(0, 3).map((b) => ({ id: b.id, name: b.name, description: b.description })),
    totalBadges: BADGES.length,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "جسم الطلب غير صالح — لازم JSON" }, { status: 400 });
  }

  const parsed = awardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "طلب غير صالح", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { action } = parsed.data;
  // Amount is decided server-side only. Any client-supplied amount is ignored
  // (the schema does not even accept one).
  const awarded = ACTION_XP[action];
  const xp = DEMO_BASE_XP + awarded;
  const level = levelForXp(xp);

  return NextResponse.json({
    ok: true,
    action,
    awarded,
    xp,
    level: level.name,
    levelId: level.id,
    message: `مبروك! كسبت ${awarded} نقطة خبرة`,
  });
}
