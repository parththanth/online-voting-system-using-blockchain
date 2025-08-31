import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Vote, 
  TrendingUp, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  color: string;
  description: string;
}

export default function RealTimeStatsGrid() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch admin metrics
      const { data: metrics, error: metricsError } = await supabase
        .from("admin_public_metrics")
        .select("*")
        .eq("id", 1)
        .single();

      if (metricsError) throw metricsError;

      // Fetch additional real-time data
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, face_verified, created_at");

      const { data: securityAlerts, error: alertsError } = await supabase
        .from("security_alerts")
        .select("id, timestamp")
        .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: faceVerifications, error: faceError } = await supabase
        .from("face_verification_attempts")
        .select("id, success, timestamp")
        .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (usersError || alertsError || faceError) {
        console.error("Error fetching additional stats:", { usersError, alertsError, faceError });
      }

      const verifiedUsers = users?.filter(u => u.face_verified).length || 0;
      const todayRegistrations = users?.filter(u => 
        new Date(u.created_at).toDateString() === new Date().toDateString()
      ).length || 0;

      const securityIncidents = securityAlerts?.length || 0;
      const successfulVerifications = faceVerifications?.filter(v => v.success).length || 0;
      const totalVerifications = faceVerifications?.length || 0;
      const verificationRate = totalVerifications > 0 ? (successfulVerifications / totalVerifications * 100) : 0;

      const currentHour = new Date().getHours();
      const hourlyVotes = (metrics?.hourly_activity as any[])?.find(h => 
        new Date(h.hour).getHours() === currentHour
      )?.count || 0;

      const newStats: StatCard[] = [
        {
          title: "Total Voters",
          value: metrics?.total_registered_voters || 0,
          change: `+${todayRegistrations} today`,
          trend: todayRegistrations > 0 ? "up" : "stable",
          icon: <Users className="w-5 h-5" />,
          color: "text-blue-600",
          description: "Registered voters"
        },
        {
          title: "Votes Cast",
          value: metrics?.total_votes_cast || 0,
          change: `${hourlyVotes} this hour`,
          trend: hourlyVotes > 0 ? "up" : "stable",
          icon: <Vote className="w-5 h-5" />,
          color: "text-green-600",
          description: "Total votes recorded"
        },
        {
          title: "Turnout Rate",
          value: `${(metrics?.voter_turnout_percentage || 0).toFixed(1)}%`,
          change: "Updated live",
          trend: "up",
          icon: <TrendingUp className="w-5 h-5" />,
          color: "text-purple-600",
          description: "Voter participation"
        },
        {
          title: "Verified Users",
          value: verifiedUsers,
          change: `${verificationRate.toFixed(1)}% success rate`,
          trend: verificationRate > 90 ? "up" : verificationRate > 70 ? "stable" : "down",
          icon: <CheckCircle className="w-5 h-5" />,
          color: "text-emerald-600",
          description: "Face verified users"
        },
        {
          title: "Security Alerts",
          value: securityIncidents,
          change: "Last 24h",
          trend: securityIncidents > 5 ? "down" : "stable",
          icon: <Shield className="w-5 h-5" />,
          color: "text-orange-600",
          description: "Security incidents"
        },
        {
          title: "System Status",
          value: "Online",
          change: "99.9% uptime",
          trend: "stable",
          icon: <Activity className="w-5 h-5" />,
          color: "text-green-600",
          description: "System health"
        }
      ];

      setStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions
    const channel = supabase
      .channel("real-time-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_public_metrics" },
        () => fetchStats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => fetchStats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => fetchStats()
      )
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="chart-hover relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                  {stat.icon}
                </div>
                <Badge variant="outline" className="live-indicator text-xs">
                  Live
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(stat.trend)}
                  <span className={getTrendColor(stat.trend)}>
                    {stat.change}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>

              {/* Animated background gradient */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5 -translate-y-6 translate-x-6">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}