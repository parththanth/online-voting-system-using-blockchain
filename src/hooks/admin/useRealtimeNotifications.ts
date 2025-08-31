import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, BarChart, UserCheck, CheckCircle, UserPlus, Shield } from "lucide-react";

export type NotificationItem = {
  id: string;
  type: "registration" | "security" | "milestone" | "vote" | "face_enrollment";
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  icon: any;
  color: string;
};

function toTime(ts?: string | null) {
  const d = ts ? new Date(ts) : new Date();
  return d.toLocaleString();
}

export function useRealtimeNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const readRef = useRef<Set<string>>(new Set());
  const fetchingRef = useRef(false);

  const upsert = (list: NotificationItem[]) => {
    // preserve read state
    const next = list.map((n) => ({ ...n, isRead: readRef.current.has(n.id) || n.isRead }));
    setItems(next);
  };

  const fetchInitial = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      // Recent security alerts
      const { data: alerts } = await supabase
        .from("security_alerts")
        .select("id, type, details, user_email, user_phone, timestamp")
        .order("timestamp", { ascending: false })
        .limit(50);

      // Recent registrations (users)
      const { data: users } = await supabase
        .from("users")
        .select("id, email, phone_number, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      const alertItems: NotificationItem[] =
        alerts?.map((a) => ({
          id: `sec-${a.id}`,
          type: "security",
          title: "Security Alert",
          description:
            (a.details && typeof a.details === "object" && (a.details as any).message) ||
            `Alert for ${a.user_email || a.user_phone || "Unknown user"}`,
          time: toTime(a.timestamp as any),
          isRead: false,
          icon: AlertTriangle,
          color: "text-red-500",
        })) || [];

      const userItems: NotificationItem[] =
        users?.map((u) => ({
          id: `reg-${u.id}`,
          type: "registration",
          title: "New Voter Registered",
          description: u.email || u.phone_number || "New registration",
          time: toTime(u.created_at as any),
          isRead: false,
          icon: UserCheck,
          color: "text-green-500",
        })) || [];

      // No milestone persistence in DB; we keep it simple and omit auto milestones
      upsert([...alertItems, ...userItems].sort((a, b) => +new Date(b.time) - +new Date(a.time)));
    } catch (e) {
      console.error("[useRealtimeNotifications] fetch error", e);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchInitial();
    
    const channel = supabase
      .channel("realtime-notifications-comprehensive")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "security_alerts" },
        (payload) => {
          console.log("[useRealtimeNotifications] New security alert", payload);
          const newAlert = payload.new as any;
          const notification: NotificationItem = {
            id: newAlert.id,
            type: 'security',
            title: 'Security Alert',
            description: `${newAlert.type} detected`,
            time: new Date(newAlert.timestamp).toLocaleTimeString(),
            isRead: false,
            icon: Shield,
            color: 'text-red-500'
          };
          setItems(prev => [notification, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "users" },
        (payload) => {
          console.log("[useRealtimeNotifications] New user registration", payload);
          const newUser = payload.new as any;
          const notification: NotificationItem = {
            id: `user-${newUser.id}`,
            type: 'registration',
            title: 'New User Registration',
            description: `${newUser.email || newUser.phone_number || 'Unknown'} registered`,
            time: new Date(newUser.created_at).toLocaleTimeString(),
            isRead: false,
            icon: UserPlus,
            color: 'text-green-500'
          };
          setItems(prev => [notification, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes" },
        (payload) => {
          console.log("[useRealtimeNotifications] New vote cast", payload);
          const newVote = payload.new as any;
          const notification: NotificationItem = {
            id: `vote-${newVote.id}`,
            type: 'vote',
            title: 'New Vote Cast',
            description: `Vote for ${newVote.party_name}`,
            time: new Date(newVote.timestamp).toLocaleTimeString(),
            isRead: false,
            icon: CheckCircle,
            color: 'text-blue-500'
          };
          setItems(prev => [notification, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "face_enrollment" },
        (payload) => {
          console.log("[useRealtimeNotifications] New face enrollment", payload);
          const newEnrollment = payload.new as any;
          const notification: NotificationItem = {
            id: `face-${newEnrollment.id}`,
            type: 'face_enrollment',
            title: 'Face Enrollment Complete',
            description: `User face verification enrolled`,
            time: new Date(newEnrollment.enrollment_date).toLocaleTimeString(),
            isRead: false,
            icon: UserCheck,
            color: 'text-purple-500'
          };
          setItems(prev => [notification, ...prev]);
        }
      )
      .subscribe();

    // Periodic refresh for missed notifications
    const interval = setInterval(fetchInitial, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const markAsRead = (id: string) => {
    readRef.current.add(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const deleteItem = (id: string) => {
    readRef.current.delete(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  return useMemo(
    () => ({
      notifications: items,
      markAsRead,
      deleteNotification: deleteItem,
    }),
    [items]
  );
}
