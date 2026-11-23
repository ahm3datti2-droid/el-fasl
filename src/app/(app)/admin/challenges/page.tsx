// EL FASL — Admin: Challenges (server-guarded: admin only)
import { redirect } from "next/navigation";
import { getServerRole, isDemoSession } from "@/lib/community-auth";
import { AdminShell, AdminChallengesClient } from "@/lib/community-ui";
import { SEED_CHALLENGES } from "@/lib/community-data";

export default async function AdminChallengesPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");
  const demo = await isDemoSession();

  return (
    <AdminShell demo={demo} title="إدارة التحديات" subtitle="إنشاء تحدي اليوم وتحديات الدوري، وتحديد تواريخها ونقاطها.">
      <AdminChallengesClient initialChallenges={SEED_CHALLENGES} />
    </AdminShell>
  );
}
