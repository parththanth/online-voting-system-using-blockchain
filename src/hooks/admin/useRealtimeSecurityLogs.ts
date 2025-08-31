
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SecurityLog } from "@/types/api";

function mapType(dbType: string | null): SecurityLog["type"] {
  switch ((dbType || "").toLowerCase()) {
    case "facial_verification":
    case "facial-verification":
      return "facial-verification";
    case "duplicate_vote":
    case "duplicate-vote":
      return "duplicate-vote";
    case "unauthorized_access":
    case "unauthorized-access":
    default:
      return "unauthorized-access";
  }
}

function inferSeverity(t: SecurityLog["type"]): SecurityLog["severity"] {
  if (t === "unauthorized-access") return "critical";
  if (t === "duplicate-vote") return "high";
  return "medium";
}

export function useRealtimeSecurityLogs(limit: number = 50) {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchLogs = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from("security_alerts")
        .select("id, type, user_id, user_email, user_phone, ip_address, details, timestamp, resolved, user_agent")
        .order("timestamp", { ascending: false })
        .limit(limit);
      if (error) throw error;

      const mapped: SecurityLog[] =
        data?.map((r) => ({
          id: r.id,
          timestamp: r.timestamp || new Date().toISOString(),
          type: mapType((r as any).type as string),
          status: r.resolved ? "blocked" : "failed",
          voter: r.user_email || r.user_phone || "Unknown",
          voterID: r.user_id || "N/A",
          location: String(r.ip_address || "N/A"),
          description:
            (r.details && typeof r.details === "object" && (r.details as any).message) ||
            (r.user_agent ? `User agent: ${r.user_agent}` : "Security alert"),
          severity: inferSeverity(mapType((r as any).type as string)),
        })) || [];

      setLogs(mapped);
      setLoading(false);
    } catch (e) {
      console.error("[useRealtimeSecurityLogs] fetch error", e);
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchLogs();
    
    const channel = supabase
      .channel("realtime-security-logs-comprehensive")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "security_alerts" },
        (payload) => {
          console.log("[useRealtimeSecurityLogs] Security alerts change", payload);
          fetchLogs();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "face_verification_attempts" },
        (payload) => {
          console.log("[useRealtimeSecurityLogs] Face verification attempts change", payload);
          fetchLogs();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "audit_logs" },
        (payload) => {
          console.log("[useRealtimeSecurityLogs] Audit logs change", payload);
          fetchLogs();
        }
      )
      .subscribe();

    // Refresh every 3 seconds for security real-time monitoring
    const interval = setInterval(fetchLogs, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [limit]);

  return useMemo(() => ({ logs, loading }), [logs, loading]);
}
