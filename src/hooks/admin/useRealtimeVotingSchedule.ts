import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VotingSchedule {
  id: number;
  voting_start: string | null;
  voting_end: string | null;
  is_active: boolean;
  updated_by: string | null;
  updated_at: string;
}

export function useRealtimeVotingSchedule() {
  const [schedule, setSchedule] = useState<VotingSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from("voting_schedule")
        .select("*")
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore not found errors
        throw error;
      }
      
      setSchedule(data);
      setLoading(false);
    } catch (error) {
      console.error("[useRealtimeVotingSchedule] Error fetching schedule:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    
    const channel = supabase
      .channel("realtime-voting-schedule")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "voting_schedule" },
        (payload) => {
          console.log("[useRealtimeVotingSchedule] Schedule change", payload);
          fetchSchedule();
        }
      )
      .subscribe();

    // Refresh every 10 seconds for schedule updates
    const interval = setInterval(fetchSchedule, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return useMemo(() => ({ schedule, loading }), [schedule, loading]);
}