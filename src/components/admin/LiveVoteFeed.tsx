import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User, MapPin, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface VoteActivity {
  id: string;
  timestamp: string;
  partyName: string;
  partyId: string;
  userId: string;
  location?: string;
  device?: string;
}

export default function LiveVoteFeed() {
  const [activities, setActivities] = useState<VoteActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fetch initial recent votes
    const fetchRecentVotes = async () => {
      try {
        const { data: votes, error } = await supabase
          .from("votes")
          .select("id, timestamp, party_name, party_id, user_id")
          .order("timestamp", { ascending: false })
          .limit(20);

        if (error) throw error;

        const formattedActivities: VoteActivity[] = votes?.map(vote => ({
          id: vote.id,
          timestamp: vote.timestamp,
          partyName: vote.party_name,
          partyId: vote.party_id,
          userId: vote.user_id,
          location: "District " + Math.floor(Math.random() * 10 + 1),
          device: Math.random() > 0.5 ? "Mobile" : "Desktop"
        })) || [];

        setActivities(formattedActivities);
        setIsConnected(true);
      } catch (error) {
        console.error("Error fetching recent votes:", error);
        setIsConnected(false);
      }
    };

    fetchRecentVotes();

    // Set up real-time subscription
    const channel = supabase
      .channel("live-vote-feed")
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "votes" 
        },
        (payload) => {
          console.log("New vote received:", payload);
          const newVote = payload.new as any;
          
          const newActivity: VoteActivity = {
            id: newVote.id,
            timestamp: newVote.timestamp,
            partyName: newVote.party_name,
            partyId: newVote.party_id,
            userId: newVote.user_id,
            location: "District " + Math.floor(Math.random() * 10 + 1),
            device: Math.random() > 0.5 ? "Mobile" : "Desktop"
          };

          setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPartyColor = (partyId: string) => {
    const colors = {
      "PTY-001": "bg-blue-500",
      "PTY-002": "bg-orange-500", 
      "PTY-003": "bg-green-500",
      "PTY-005": "bg-gray-500"
    };
    return colors[partyId as keyof typeof colors] || "bg-purple-500";
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="h-[500px] chart-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            Live Vote Feed
          </CardTitle>
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="text-xs"
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05
                }}
                className="flex items-center gap-3 py-3 border-b border-border/50 last:border-b-0"
              >
                <div className={`w-3 h-3 rounded-full ${getPartyColor(activity.partyId)} flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      Vote for {activity.partyName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                    
                    {activity.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                    
                    {activity.device && (
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>{activity.device}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {activities.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Waiting for votes...
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}