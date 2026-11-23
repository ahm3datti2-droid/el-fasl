// EL FASL — gamification helpers (pure functions, no DB, no client state).
// XP is only ever awarded server-side; the UI only displays these values.
import { LEVELS, type Level } from "./data";

export const XP_REWARDS = {
  challengeComplete: 20,
  dailyChallenge: 30,
  simulatorComplete: 25,
  ideaShared: 15,
  ideaLiked: 2,
  helpResponse: 10,
  helpSolved: 20,
  streakDay: 5,
  comment: 3,
} as const;

export function levelForXp(xp: number): Level {
  const safe = Math.max(0, Math.floor(xp));
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (safe >= level.minXp) current = level;
  }
  return current;
}

export function nextLevel(xp: number): Level | null {
  const safe = Math.max(0, Math.floor(xp));
  for (const level of LEVELS) {
    if (safe < level.minXp) return level;
  }
  return null;
}

export interface XpProgress {
  current: Level;
  next: Level | null;
  progress: number; // 0..100 toward next level
  xpIntoLevel: number;
  xpNeeded: number; // xp remaining to next level (0 at max level)
}

export function xpProgress(xp: number): XpProgress {
  const safe = Math.max(0, Math.floor(xp));
  const current = levelForXp(safe);
  const next = nextLevel(safe);
  if (!next) {
    return { current, next: null, progress: 100, xpIntoLevel: safe - current.minXp, xpNeeded: 0 };
  }
  const span = next.minXp - current.minXp;
  const into = safe - current.minXp;
  return {
    current,
    next,
    progress: Math.min(100, Math.round((into / span) * 100)),
    xpIntoLevel: into,
    xpNeeded: next.minXp - safe,
  };
}

export type BadgeIcon = "trophy" | "lightbulb" | "flame" | "star" | "users" | "crown" | "medal" | "zap";

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: BadgeIcon;
}

export const BADGES: BadgeDef[] = [
  { id: "first-challenge", name: "أول تحدي", description: "أكملت أول تحدي في المنصة", icon: "trophy" },
  { id: "first-idea", name: "أول فكرة", description: "شاركت أول فكرة تدريس مع المجتمع", icon: "lightbulb" },
  { id: "helper", name: "مساعد المجتمع", description: "ساعدت 5 مدرسين بحلول عملية", icon: "users" },
  { id: "innovator", name: "مبتكر الأسبوع", description: "فكرتك كانت الأعلى تقييمًا هذا الأسبوع", icon: "zap" },
  { id: "streak-7", name: "7 أيام متتالية", description: "دخلت المنصة 7 أيام ورا بعض", icon: "flame" },
  { id: "classroom-expert", name: "خبير إدارة الفصل", description: "أكملت 10 مواقف في محاكي المدرس", icon: "medal" },
  { id: "ten-ideas", name: "صاحب 10 أفكار", description: "شاركت 10 أفكار تدريس", icon: "star" },
  { id: "active-member", name: "عضو نشيط", description: "وصلت إلى 500 نقطة خبرة", icon: "crown" },
];

export interface UserStats {
  challengesCompleted: number;
  ideasCount: number;
  helpResponses: number;
  simulatorCompleted: number;
  streakDays: number;
  xp: number;
}

/** Badge ids a user has earned from their stats. Server-side only logic. */
export function earnedBadgeIds(stats: UserStats): string[] {
  const earned: string[] = [];
  if (stats.challengesCompleted >= 1) earned.push("first-challenge");
  if (stats.ideasCount >= 1) earned.push("first-idea");
  if (stats.helpResponses >= 5) earned.push("helper");
  if (stats.streakDays >= 7) earned.push("streak-7");
  if (stats.simulatorCompleted >= 10) earned.push("classroom-expert");
  if (stats.ideasCount >= 10) earned.push("ten-ideas");
  if (stats.xp >= 500) earned.push("active-member");
  return earned;
}

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
