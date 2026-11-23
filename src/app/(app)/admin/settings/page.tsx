// EL FASL — Admin: Settings — badges & XP levels (server-guarded: admin only)
import { redirect } from "next/navigation";
import { getServerRole, isDemoSession } from "@/lib/community-auth";
import { AdminShell, AdminSettingsClient } from "@/lib/community-ui";

export default async function AdminSettingsPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");
  const demo = await isDemoSession();

  return (
    <AdminShell demo={demo} title="إعدادات المنصة" subtitle="شارات الإنجاز، مستويات XP، وقواعد النقاط.">
      <AdminSettingsClient />
    </AdminShell>
  );
}
