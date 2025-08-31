
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PartywiseMetric = {
  partyId: string;
  partyName: string;
  votes: number;
  percentage: number;
};

export type HourlyBucket = {
  hour: string; // ISO string like 2025-01-01T13:00:00Z
  count: number;
};

export type AdminMetrics = {
  totalRegisteredVoters: number;
  totalVotesCast: number;
  voterTurnoutPercentage: number;
  partywiseVotes: PartywiseMetric[];
  hourlyActivity: HourlyBucket[];
  updatedAt: string;
};

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchMetrics = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from("admin_public_metrics")
        .select("id, total_registered_voters, total_votes_cast, voter_turnout_percentage, partywise_votes, hourly_activity, updated_at")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;

      const mapped: AdminMetrics = {
        totalRegisteredVoters: data?.total_registered_voters ?? 0,
        totalVotesCast: data?.total_votes_cast ?? 0,
        voterTurnoutPercentage: Number(data?.voter_turnout_percentage ?? 0),
        partywiseVotes: (data?.partywise_votes as PartywiseMetric[]) ?? [],
        hourlyActivity: (data?.hourly_activity as HourlyBucket[]) ?? [],
        updatedAt: data?.updated_at ?? new Date().toISOString(),
      };
      setMetrics(mapped);
      setLoading(false);
    } catch (e) {
      console.error("[useAdminMetrics] fetch error", e);
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel("realtime-admin-metrics-comprehensive")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_public_metrics" },
        (payload) => {
          console.log("[useAdminMetrics] Admin metrics update:", payload);
          fetchMetrics();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          console.log("[useAdminMetrics] Votes update:", payload);
          // Small delay to allow function to process
          setTimeout(fetchMetrics, 500);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          console.log("[useAdminMetrics] Users update:", payload);
          // Small delay to allow function to process
          setTimeout(fetchMetrics, 500);
        }
      )
      .subscribe();

    // Periodic refresh every 10 seconds for real-time feel
    const interval = setInterval(fetchMetrics, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return useMemo(() => ({ metrics, loading }), [metrics, loading]);
}
