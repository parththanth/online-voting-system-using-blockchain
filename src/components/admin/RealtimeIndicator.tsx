import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeIndicatorProps {
  className?: string;
}

export default function RealtimeIndicator({ className = "" }: RealtimeIndicatorProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Monitor connection status
    const handleConnectionStatus = () => {
      setIsConnected(true);
      setLastUpdate(new Date());
    };

    const handleConnectionError = () => {
      setIsConnected(false);
    };

    // Test connection with a simple query
    const testConnection = async () => {
      try {
        await supabase.from('admin_public_metrics').select('updated_at').limit(1);
        handleConnectionStatus();
      } catch (error) {
        handleConnectionError();
      }
    };

    // Test connection every 5 seconds
    const interval = setInterval(testConnection, 5000);
    testConnection(); // Initial test

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center gap-1 text-xs animate-pulse"
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            LIVE
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            OFFLINE
          </>
        )}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {lastUpdate.toLocaleTimeString()}
      </span>
    </motion.div>
  );
}