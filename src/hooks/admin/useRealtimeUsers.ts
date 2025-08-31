
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminUserRow = {
  id: string;
  name: string;
  voterId: string;
  status: "Verified" | "Pending" | "Flagged";
  lastActivity: string;
  address?: string;
  mobile?: string;
};

function mapStatus(row: any): AdminUserRow["status"] {
  if (row.failed_otp_attempts && row.failed_otp_attempts >= 5) return "Flagged";
  if (row.face_verified && row.otp_verified) return "Verified";
  return "Pending";
}

export function useRealtimeUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchUsers = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, phone_number, created_at, updated_at, face_verified, otp_verified, failed_otp_attempts")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const mapped: AdminUserRow[] =
        data?.map((u) => {
          const display = u.email || u.phone_number || "Unknown";
          return {
            id: u.id,
            name: display,
            voterId: u.id,
            status: mapStatus(u),
            lastActivity: new Date(u.updated_at || u.created_at || new Date().toISOString()).toLocaleString(),
            address: undefined,
            mobile: u.phone_number || undefined,
          };
        }) || [];

      setUsers(mapped);
      setLoading(false);
    } catch (e) {
      console.error("[useRealtimeUsers] fetch error", e);
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchUsers();
    
    const channel = supabase
      .channel("realtime-users-comprehensive")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          console.log("[useRealtimeUsers] Users change", payload);
          fetchUsers();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "face_enrollment" },
        (payload) => {
          console.log("[useRealtimeUsers] Face enrollment change", payload);
          fetchUsers();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          console.log("[useRealtimeUsers] Votes change affecting users", payload);
          fetchUsers();
        }
      )
      .subscribe();

    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchUsers, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return useMemo(() => ({ users, loading }), [users, loading]);
}
