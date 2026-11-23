// EL FASL — Admin: Reports (server-guarded: admin only)
import { redirect } from "next/navigation";
import { getServerRole, isDemoSession } from "@/lib/community-auth";
import { AdminShell, AdminReportsClient } from "@/lib/community-ui";
import { SEED_REPORTS } from "@/lib/community-data";

export default async function AdminReportsPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");
  const demo = await isDemoSession();

  return (
    <AdminShell demo={demo} title="مراجعة البلاغات" subtitle="بلاغات المستخدمين عن محتوى مخالف — عالجها بحذف المحتوى أو رفض البلاغ.">
      <AdminReportsClient initialReports={SEED_REPORTS} />
    </AdminShell>
  );
}
