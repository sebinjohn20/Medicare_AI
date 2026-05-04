"use client";
import { useState, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Card, Button, EmptyState, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const TYPE_ICONS = { appointment: "📅", reminder: "⏰", cancellation: "❌", system: "🔔", emergency: "🚨" };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchNotifications = () => {
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotifications(d.notifications); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    setMarking(true);
    await fetch("/api/notifications", { method: "PATCH" });
    fetchNotifications();
    setMarking(false);
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{unread} unread</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" loading={marking} onClick={markAllRead}>
            <CheckCheck className="w-4 h-4" />Mark all read
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Notifications will appear here." />
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n._id} className={cn("flex gap-4 p-5 transition-colors", !n.read ? "bg-blue-50/50" : "hover:bg-gray-50")}>
                <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
