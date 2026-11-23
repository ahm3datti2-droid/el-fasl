// EL FASL — Admin: Users (server-guarded: admin only)
import { redirect } from "next/navigation";
import { getServerRole } from "@/lib/community-auth";
import { AdminShell, AdminUsersClient } from "@/lib/community-ui";
import { SEED_ADMIN_USERS } from "@/lib/community-data";

export default async function AdminUsersPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");

  return (
    <AdminShell title="إدارة المستخدمين" subtitle="تعطيل حساب، حظر مستخدم، أو تغيير الدور — كل إجراء يتأكد قبل تنفيذه.">
      <AdminUsersClient initialUsers={SEED_ADMIN_USERS} />
    </AdminShell>
  );
}
