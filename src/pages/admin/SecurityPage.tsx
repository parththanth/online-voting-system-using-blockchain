
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SecurityLogsTable from "@/components/admin/SecurityLogsTable";
import AdminLayout from "@/components/admin/AdminLayout";
import { useRealtimeSecurityLogs } from "@/hooks/admin/useRealtimeSecurityLogs";

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

const SecurityPage = () => {
  const { logs, loading } = useRealtimeSecurityLogs(100);

  return (
    <AdminLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariant}
        className="space-y-6"
      >
        <motion.div variants={itemVariant}>
          <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="p-1.5 bg-red-50 rounded-full dark:bg-red-900/30">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <CardTitle>Security Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground p-6">Loading security logs...</div>
              ) : (
                <SecurityLogsTable logs={logs} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default SecurityPage;
