// EL FASL — Admin: Scenarios (server-guarded: admin only)
import { redirect } from "next/navigation";
import { getServerRole } from "@/lib/community-auth";
import { AdminShell, AdminScenariosClient } from "@/lib/community-ui";
import { SEED_SCENARIOS } from "@/lib/community-data";

export default async function AdminSituationsPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");

  return (
    <AdminShell title="إدارة سيناريوهات المحاكاة" subtitle="مواقف محاكي المدرس: إضافة مواقف جديدة، تصنيفها، وحذف المخالف منها.">
      <AdminScenariosClient initialScenarios={SEED_SCENARIOS} />
    </AdminShell>
  );
}
