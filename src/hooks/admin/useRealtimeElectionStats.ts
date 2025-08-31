
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ElectionStats, PartyVoteStats, DistrictTurnout } from "@/types/api";

type StatsState = {
  stats: ElectionStats | null;
  loading: boolean;
};

export function useRealtimeElectionStats() {
  const [state, setState] = useState<StatsState>({ stats: null, loading: true });
  const fetchingRef = useRef(false);

  const fetchAll = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    console.log("[useRealtimeElectionStats] fetching...");
    try {
      // Registered voters (count only)
      const { count: totalRegisteredVoters, error: usersErr } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });
      if (usersErr) throw usersErr;

      // Votes: user_id, party_name, party_id, timestamp
      const { data: votes, error: votesErr } = await supabase
        .from("votes")
        .select("user_id, party_id, party_name, timestamp");
      if (votesErr) throw votesErr;

      // Users for district map (district not present; default to "Unknown")
      const { data: usersDistricts, error: usersDistrictErr } = await supabase
        .from("users")
        .select("id"); // removed 'district' column to match current schema
      if (usersDistrictErr) throw usersDistrictErr;

      const totalVotesCast = votes?.length ?? 0;
      const voterTurnoutPercentage =
        totalRegisteredVoters && totalRegisteredVoters > 0
          ? (totalVotesCast / totalRegisteredVoters) * 100
          : 0;

      // Partywise stats
      const partyMap = new Map<string, { id: string; name: string; votes: number }>();
      votes?.forEach((v) => {
        const key = v.party_id || v.party_name || "Unknown";
        const current = partyMap.get(key) || {
          id: v.party_id || key,
          name: v.party_name || key,
          votes: 0,
        };
        current.votes += 1;
        partyMap.set(key, current);
      });
      const partywiseVotes: PartyVoteStats[] = Array.from(partyMap.values()).map((p) => ({
        partyId: p.id,
        partyName: p.name,
        votes: p.votes,
        percentage: totalVotesCast > 0 ? (p.votes / totalVotesCast) * 100 : 0,
      }));

      // District-wise turnout (default "Unknown")
      const usersByDistrict = new Map<string, number>();
      usersDistricts?.forEach((u) => {
        const d = "Unknown";
        usersByDistrict.set(d, (usersByDistrict.get(d) || 0) + 1);
      });
      const votesByDistrict = new Map<string, number>();
      const userDistrictLookup = new Map<string, string>();
      usersDistricts?.forEach((u) => userDistrictLookup.set(u.id, "Unknown"));
      votes?.forEach((v) => {
        const d = userDistrictLookup.get(v.user_id) || "Unknown";
        votesByDistrict.set(d, (votesByDistrict.get(d) || 0) + 1);
      });
      const districtWiseTurnout: DistrictTurnout[] = Array.from(usersByDistrict.entries()).map(
        ([district, totalVoters]) => {
          const votesCast = votesByDistrict.get(district) || 0;
          return {
            district,
            totalVoters,
            votesCast,
            turnout: totalVoters > 0 ? (votesCast / totalVoters) * 100 : 0,
          };
        }
      );

      const stats: ElectionStats = {
        totalRegisteredVoters: totalRegisteredVoters || 0,
        totalVotesCast,
        voterTurnoutPercentage,
        partywiseVotes,
        districtWiseTurnout,
      };

      setState({ stats, loading: false });
    } catch (err) {
      console.error("[useRealtimeElectionStats] fetch error", err);
      setState((s) => ({ ...s, loading: false }));
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("realtime-election-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, (payload) => {
        console.log("[useRealtimeElectionStats] votes change", payload);
        fetchAll();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
        console.log("[useRealtimeElectionStats] users change", payload);
        fetchAll();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return useMemo(() => state, [state]);
}
