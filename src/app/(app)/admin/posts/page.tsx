// EL FASL — Admin: Posts moderation (server-guarded: admin only)
import { redirect } from "next/navigation";
import { getServerRole } from "@/lib/community-auth";
import { AdminShell, AdminPostsClient } from "@/lib/community-ui";
import { SEED_POSTS } from "@/lib/community-data";

export default async function AdminPostsPage() {
  const role = await getServerRole();
  if (role !== "admin") redirect("/dashboard");

  return (
    <AdminShell title="إدارة المنشورات والأفكار" subtitle="مراجعة منشورات فضفضة مدرس وأفكار المجتمع — إخفاء أو حذف المحتوى المخالف.">
      <AdminPostsClient initialPosts={SEED_POSTS} />
    </AdminShell>
  );
}
