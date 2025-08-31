
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type HourlyData = { time: string; votes: number };
type PlatformUsage = { name: string; value: number };
type Regional = { region: string; votes: number };

function hourLabel(date: Date) {
  const h = date.getHours();
  const hh = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hh}:00 ${ampm}`;
}

function isMobileUA(ua: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

export function useRealtimeAnalytics() {
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [platforms, setPlatforms] = useState<PlatformUsage[]>([]);
  const [regional, setRegional] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchAll = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      // Votes for hourly and regional
      const { data: votes, error: votesErr } = await supabase
        .from("votes")
        .select("user_id, timestamp");
      if (votesErr) throw votesErr;

      // Users for mapping (district not available; default to "Unknown")
      const { data: users, error: usersErr } = await supabase
        .from("users")
        .select("id"); // removed 'district' column to match current schema
      if (usersErr) throw usersErr;

      // Security alerts for platform usage
      const { data: alerts, error: alertsErr } = await supabase
        .from("security_alerts")
        .select("user_agent")
        .order("timestamp", { ascending: false })
        .limit(200);
      if (alertsErr) throw alertsErr;

      // Hourly aggregation (last 12 hours)
      const buckets: Map<string, number> = new Map();
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        buckets.set(hourLabel(d), 0);
      }
      votes?.forEach((v) => {
        const t = v.timestamp ? new Date(v.timestamp) : new Date();
        const label = hourLabel(t);
        if (buckets.has(label)) {
          buckets.set(label, (buckets.get(label) || 0) + 1);
        }
      });
      const hourlyData: HourlyData[] = Array.from(buckets.entries()).map(([time, votes]) => ({ time, votes }));

      // Platform usage from user_agent
      let mobile = 0, desktop = 0;
      alerts?.forEach((a) => {
        const ua = (a.user_agent || "").toString();
        if (!ua) return;
        if (isMobileUA(ua)) mobile++;
        else desktop++;
      });
      const totalUA = mobile + desktop;
      const platformsData: PlatformUsage[] = totalUA === 0
        ? [{ name: "Mobile", value: 0 }, { name: "Web/Desktop", value: 0 }]
        : [
            { name: "Mobile", value: Math.round((mobile / totalUA) * 100) },
            { name: "Web/Desktop", value: Math.round((desktop / totalUA) * 100) },
          ];

      // Regional distribution (default to "Unknown" without district column)
      const userDistrict = new Map<string, string>();
      users?.forEach((u) => userDistrict.set(u.id, "Unknown"));
      const regionCounts = new Map<string, number>();
      votes?.forEach((v) => {
        const d = userDistrict.get(v.user_id) || "Unknown";
        regionCounts.set(d, (regionCounts.get(d) || 0) + 1);
      });
      const regionalData: Regional[] = Array.from(regionCounts.entries()).map(([region, votes]) => ({
        region,
        votes,
      }));

      setHourly(hourlyData);
      setPlatforms(platformsData);
      setRegional(regionalData);
      setLoading(false);
    } catch (e) {
      console.error("[useRealtimeAnalytics] fetch error", e);
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchAll();
    
    const channel = supabase
      .channel("realtime-analytics-comprehensive")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          console.log("[useRealtimeAnalytics] Votes change", payload);
          fetchAll();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          console.log("[useRealtimeAnalytics] Users change", payload);
          fetchAll();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "security_alerts" },
        (payload) => {
          console.log("[useRealtimeAnalytics] Security alerts change", payload);
          fetchAll();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "face_verification_attempts" },
        (payload) => {
          console.log("[useRealtimeAnalytics] Face verification change", payload);
          fetchAll();
        }
      )
      .subscribe();

    // Refresh every 8 seconds for analytics updates
    const interval = setInterval(fetchAll, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return useMemo(() => ({ hourly, platforms, regional, loading }), [hourly, platforms, regional, loading]);
}
