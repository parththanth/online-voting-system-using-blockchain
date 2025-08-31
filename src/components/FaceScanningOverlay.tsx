
import { motion } from "framer-motion";
import { Scan, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaceScanningOverlayProps {
  isScanning: boolean;
  progress: number; // 0 to 100
  className?: string;
}

const FaceScanningOverlay = ({
  isScanning,
  progress,
  className,
}: FaceScanningOverlayProps) => {
  if (!isScanning) return null;
  
  return (
    <div className={cn(
      "absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20",
      className
    )}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        {/* Scanning border animation */}
        <motion.div
          className="absolute inset-0 border-4 border-green-500 rounded-full"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Scanning line animation */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-green-500/70 rounded-full z-10"
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <div className="w-64 h-64 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              ease: "linear"
            }}
            className="text-green-500"
          >
            <Scan size={48} />
          </motion.div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="text-white font-medium">Scanning Your Face</div>
        
        {/* Progress bar */}
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="flex items-center gap-2 text-white/70">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear",
            }}
          >
            <Loader size={16} />
          </motion.div>
          <span>Processing...</span>
        </div>
      </div>
    </div>
  );
};

export default FaceScanningOverlay;
