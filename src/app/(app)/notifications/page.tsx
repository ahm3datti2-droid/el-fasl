// EL FASL — Notifications (الإشعارات)
"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  Heart,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Trophy,
  LifeBuoy,
  Megaphone,
} from "lucide-react";
import { AppShell, Chip } from "@/lib/community-ui";
import { SEED_NOTIFICATIONS, type AppNotification, type NotificationKind } from "@/lib/community-data";

const KIND_META: Record<NotificationKind, { label: string; icon: typeof Bell; classes: string }> = {
  challenge: { label: "تحدي جديد", icon: Trophy, classes: "bg-blue-50 text-[#4568FF]" },
  reply: { label: "رد جديد", icon: MessageCircle, classes: "bg-violet-50 text-[#7C5CFC]" },
  like: { label: "إعجاب", icon: Heart, classes: "bg-red-50 text-red-500" },
  badge: { label: "شارة", icon: Sparkles, classes: "bg-amber-50 text-amber-600" },
  level: { label: "ترقية مستوى", icon: Trophy, classes: "bg-green-50 text-green-600" },
  help_solved: { label: "حل طلب مساعدة", icon: LifeBuoy, classes: "bg-green-50 text-green-600" },
  idea: { label: "فكرة اليوم", icon: Lightbulb, classes: "bg-amber-50 text-amber-600" },
  welcome: { label: "ترحيب", icon: Megaphone, classes: "bg-gray-100 text-gray-600" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const visible = filter === "all" ? notifications : notifications.filter((n) => !n.read);

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <AppShell title="الإشعارات" subtitle="كل جديد في المنصة — من غير إزعاج، وانت اللي بتتحكم فيها من الإعدادات." active="profile">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Chip tone="blue">
          <Bell className="h-3.5 w-3.5" /> {unreadCount} غير مقروءة
        </Chip>
        <button onClick={() => setFilter("all")} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm ${filter === "all" ? "bg-[#101828] text-white" : "bg-white text-gray-700"}`}>
          الكل
        </button>
        <button onClick={() => setFilter("unread")} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm ${filter === "unread" ? "bg-[#101828] text-white" : "bg-white text-gray-700"}`}>
          غير المقروءة
        </button>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="mr-auto flex items-center gap-1 rounded-full bg-[#4568FF] px-4 py-2 text-sm font-black text-white hover:bg-[#3556e0]">
            <Check className="h-4 w-4" /> تعليم الكل كمقروء
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((n) => {
          const meta = KIND_META[n.kind];
          const Icon = meta.icon;
          return (
            <article
              key={n.id}
              className={`flex gap-3 rounded-3xl bg-white p-4 shadow-sm ${n.read ? "opacity-70" : "ring-1 ring-blue-100"}`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.classes}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black">{n.title}</h3>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-[#4568FF]" />}
                  <span className="text-xs font-bold text-gray-400">{n.createdAt}</span>
                </div>
                <p className="mt-1 text-sm font-semibold leading-7 text-gray-600">{n.body}</p>
                <p className="mt-1 text-xs font-bold text-gray-400">{meta.label}</p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="shrink-0 self-start rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-[#4568FF]"
                >
                  تعليم كمقروء
                </button>
              )}
            </article>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="rounded-3xl bg-white p-10 text-center font-bold text-gray-400 shadow-sm">
          مفيش إشعارات غير مقروءة — انت متابع كل حاجة.
        </p>
      )}
      <p className="mt-5 rounded-2xl bg-white p-4 text-center text-xs font-semibold leading-6 text-gray-400 shadow-sm">
        الإشعارات هنا هادية: بنبعت بس المهم — تحدي جديد، رد على مشاركتك، شارة أو ترقية مستوى. تقدر توقف أي نوع من صفحة الإعدادات.
      </p>
    </AppShell>
  );
}
