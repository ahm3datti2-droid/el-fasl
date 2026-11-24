// EL FASL — Admin: Users (server-guarded: admin only)
// Lists REAL profiles from Supabase when configured; the 8 seed users are
// only the demo-mode fallback (no Supabase). NOTE: the row actions in
// AdminUsersClient (change role / disable / ban) are still client-side state
// only — they do not persist yet.
import { redirect } from "next/navigation";
import { getServerRole, isDemoSession } from "@/lib/community-auth";
import { AdminShell, AdminUsersClient } from "@/lib/community-ui";
import { SEED_ADMIN_USERS, type AdminUserRow } from "@/lib/community-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";

async function loadRealUsers(): Promise<AdminUserRow[] | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, specialization, stage, role, is_disabled, xp, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return null;
  return data.map((p) => ({
    id: p.id,
    name: p.full_name ?? p.email.split("@")[0],
    email: p.email,
    specialization: p.specialization ?? "—",
    stage: p.stage ?? "—",
    role: (p.role === "admin" || p.role === "moderator" ? p.role : "user") as AdminUserRow["role"],
    status: (p.is_disabled ? "معطّل" : "نشط") as AdminUserRow["status"],
    xp: p.xp ?? 0,
    joinedAt: p.created_at ? String(p.created_at).slice(0, 10) : "",
  }));
}

export default async function AdminUsersPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");
  const demo = await isDemoSession();

  let users = SEED_ADMIN_USERS;
  try {
    const real = await loadRealUsers();
    if (real) users = real;
  } catch {
    // Any live-query failure falls back to the seed list.
  }

  return (
    <AdminShell demo={demo} title="إدارة المستخدمين" subtitle="تعطيل حساب، حظر مستخدم، أو تغيير الدور — كل إجراء يتأكد قبل تنفيذه.">
      <AdminUsersClient initialUsers={users} />
    </AdminShell>
  );
}
