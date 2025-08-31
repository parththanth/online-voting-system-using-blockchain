
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  BarChart3, 
  PieChart, 
  MapPin, 
  Activity, 
  TrendingUp,
  Users,
  Clock
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  BarChart as ReBarChart,
  Bar,
} from "recharts";
import { useRealtimeAnalytics } from "@/hooks/admin/useRealtimeAnalytics";
import RealTimeStatsGrid from "@/components/admin/RealTimeStatsGrid";
import LiveVoteFeed from "@/components/admin/LiveVoteFeed";
import EnhancedAnalyticsCharts from "@/components/admin/EnhancedAnalyticsCharts";

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

const PLATFORM_COLORS = ['#0088FE', '#00C49F'];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { hourly, platforms, regional, loading } = useRealtimeAnalytics();

  const exportData = (dataType: string) => {
    console.log(`Exporting ${dataType} data as CSV`);
    alert(`${dataType} data exported successfully!`);
  };

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariant} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time voting analytics with advanced insights and predictions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="live-indicator text-sm">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
            <Button variant="outline" onClick={() => exportData('all')}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Advanced Charts</span>
            </TabsTrigger>
            <TabsTrigger value="platforms" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Platform Usage</span>
            </TabsTrigger>
            <TabsTrigger value="regional" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Regional</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Live Feed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div variants={itemVariant}>
              <RealTimeStatsGrid />
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariant}>
                <Card className="chart-hover">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Hourly Activity
                    </CardTitle>
                    <Badge variant="outline" className="live-indicator">Live</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourly}>
                          <defs>
                            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="votes"
                            stroke="hsl(var(--chart-1))"
                            fillOpacity={1}
                            fill="url(#colorVotes)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariant}>
                <Card className="chart-hover">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Platform Distribution
                    </CardTitle>
                    <Badge variant="outline" className="live-indicator">Live</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={platforms}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="hsl(var(--chart-2))"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {platforms.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`hsl(var(--chart-${index + 1}))`} 
                              />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => `${value}%`} />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <motion.div variants={itemVariant}>
              <EnhancedAnalyticsCharts />
            </motion.div>
          </TabsContent>

          <TabsContent value="trends">
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Hourly Voting Activity</CardTitle>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => exportData('voting-trends')}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </Button>
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={hourly}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="votes"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorVotes)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="platforms">
            <motion.div variants={itemVariant}>
              <Card className="chart-hover">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Detailed Platform Usage
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="live-indicator">Live</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportData('platform-usage')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={platforms}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={180}
                          fill="hsl(var(--chart-1))"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {platforms.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`hsl(var(--chart-${index + 1}))`} 
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, "Usage"]}
                          labelFormatter={(label) => `Platform: ${label}`}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="regional">
            <motion.div variants={itemVariant}>
              <Card className="chart-hover">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Regional Vote Distribution
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="live-indicator">Live</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportData('regional-distribution')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart
                        data={regional}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="votes" 
                          fill="url(#colorBar)"
                          radius={[4, 4, 0, 0]}
                        />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            <motion.div variants={itemVariant}>
              <LiveVoteFeed />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
}
