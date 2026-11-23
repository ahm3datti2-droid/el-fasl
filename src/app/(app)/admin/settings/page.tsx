// EL FASL — Admin: Settings — badges & XP levels (server-guarded: admin only)
import { redirect } from "next/navigation";
import { getServerRole } from "@/lib/community-auth";
import { AdminShell, AdminSettingsClient } from "@/lib/community-ui";

export default async function AdminSettingsPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");

  return (
    <AdminShell title="إعدادات المنصة" subtitle="شارات الإنجاز، مستويات XP، وقواعد النقاط.">
      <AdminSettingsClient />
    </AdminShell>
  );
}
