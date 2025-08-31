
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, User, BarChart3, Clock, AlertTriangle, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Remove socket imports and types, replace with realtime hooks
// import { initializeSocket, joinElection, onVoteUpdate } from "@/lib/socket";
// import { ElectionStats, SecurityLog } from "@/types/api";
import SecurityLogsTable from "@/components/admin/SecurityLogsTable";
import VotingDistributionChart from "@/components/admin/VotingDistributionChart";
import TurnoutChart from "@/components/admin/TurnoutChart";
import ElectionCountdown from "@/components/admin/ElectionCountdown";
import ProjectedResultsChart from "@/components/admin/ProjectedResultsChart";
import HourlyActivityChart from "@/components/admin/HourlyActivityChart";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminMetrics } from "@/hooks/admin/useAdminMetrics";
import { useRealtimeSecurityLogs } from "@/hooks/admin/useRealtimeSecurityLogs";
import RealtimeIndicator from "@/components/admin/RealtimeIndicator";

// Animation variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const cardHoverVariant = {
  hover: { 
    scale: 1.02,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  }
};

const Admin = () => {
  // Election data realtime
  const { metrics, loading } = useAdminMetrics();
  // Security logs realtime for the Security tab
  const { logs: securityLogs } = useRealtimeSecurityLogs(50);

  // Election timing
  const electionEndTime = new Date();
  electionEndTime.setHours(electionEndTime.getHours() + 4); // End in 4 hours from now

  // Remove socket setup
  // Realtime metrics are handled via Supabase subscriptions in hooks

  return (
    <AdminLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariant}
        className="space-y-6"
      >
        <motion.div variants={itemVariant} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Secure Election Monitoring</p>
            </div>
          </div>
          <RealtimeIndicator />
        </motion.div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10">
              <BarChart3 className="w-4 h-4 mr-2" />Overview
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary/10">
              <AlertTriangle className="w-4 h-4 mr-2" />Security
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/10">
              <TrendingUp className="w-4 h-4 mr-2" />Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-0">
            <motion.div variants={containerVariant} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariant} whileHover="hover">
                <motion.div variants={cardHoverVariant}>
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium">Registered Voters</CardTitle>
                      <div className="p-1.5 bg-blue-50 rounded-full dark:bg-blue-900/30">
                        <User className="w-4 h-4 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {loading ? "Loading..." : metrics?.totalRegisteredVoters.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Eligible to vote in this election
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariant} whileHover="hover">
                <motion.div variants={cardHoverVariant}>
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
                      <div className="p-1.5 bg-green-50 rounded-full dark:bg-green-900/30">
                        <BarChart3 className="w-4 h-4 text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {loading ? "Loading..." : metrics?.totalVotesCast.toLocaleString()}
                      </div>
                      <div className="flex items-center mt-1">
                        <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600">
                          LIVE
                        </Badge>
                        <p className="text-xs text-muted-foreground ml-2">
                          Vote count
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariant} whileHover="hover">
                <motion.div variants={cardHoverVariant}>
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium">Turnout</CardTitle>
                      <div className="p-1.5 bg-purple-50 rounded-full dark:bg-purple-900/30">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {loading ? "Loading..." : `${(metrics?.voterTurnoutPercentage ?? 0).toFixed(1)}%`}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Of registered voters
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariant} whileHover="hover">
                <motion.div variants={cardHoverVariant}>
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium">Election Timeline</CardTitle>
                      <div className="p-1.5 bg-orange-50 rounded-full dark:bg-orange-900/30">
                        <Clock className="w-4 h-4 text-orange-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ElectionCountdown endTime={electionEndTime} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Until voting closes
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div variants={containerVariant} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariant} whileHover="hover">
                <motion.div variants={cardHoverVariant}>
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      {loading ? (
                        <div className="flex items-center justify-center h-[300px]">Loading chart data...</div>
                      ) : (
                        <VotingDistributionChart data={metrics?.partywiseVotes || []} />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariant} whileHover="hover">
                <motion.div variants={cardHoverVariant}>
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      {loading ? (
                        <div className="flex items-center justify-center h-[300px]">Loading chart data...</div>
                      ) : (
                        <TurnoutChart data={metrics ? [{ district: 'Unknown', totalVoters: metrics.totalRegisteredVoters, votesCast: metrics.totalVotesCast, turnout: metrics.voterTurnoutPercentage }] : []} />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div variants={containerVariant} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariant} whileHover="hover">
                <motion.div variants={cardHoverVariant}>
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      {loading ? (
                        <div className="flex items-center justify-center h-[300px]">Loading chart data...</div>
                      ) : (
                        <ProjectedResultsChart data={metrics?.partywiseVotes || []} />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              
              <motion.div variants={itemVariant} whileHover="hover">
                <motion.div variants={cardHoverVariant}>
                  <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      {loading ? (
                        <div className="flex items-center justify-center h-[300px]">Loading chart data...</div>
                      ) : (
                        <HourlyActivityChart 
                          data={metrics?.hourlyActivity}
                          totalVoters={metrics?.totalRegisteredVoters || 0} 
                          totalVotesCast={metrics?.totalVotesCast || 0}
                        />
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="security">
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center gap-2">
                  <div className="p-1.5 bg-red-50 rounded-full dark:bg-red-900/30">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <CardTitle>Security Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <SecurityLogsTable logs={securityLogs} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-full dark:bg-blue-900/30">
                      <Eye className="w-4 h-4 text-blue-500" />
                    </div>
                    <CardTitle>Advanced Analytics</CardTitle>
                  </div>
                  <Badge>Coming Soon</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground py-10 text-center">
                    Demographic breakdown, predictive modeling, and AI-powered insights coming in the next update.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
}

export default Admin;
