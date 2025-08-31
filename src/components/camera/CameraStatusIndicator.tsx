
import React from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Check, X } from "lucide-react";

interface CameraStatusIndicatorProps {
  cameraActive: boolean;
  cameraLoading: boolean;
  verificationSuccess: boolean;
  verificationFailed: boolean;
}

const CameraStatusIndicator: React.FC<CameraStatusIndicatorProps> = ({
  cameraActive,
  cameraLoading,
  verificationSuccess,
  verificationFailed
}) => {
  if (verificationSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-green-500/80 backdrop-blur-sm"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: 2, duration: 0.5 }}
        >
          <Check className="w-16 h-16 text-white" />
        </motion.div>
      </motion.div>
    );
  }
  
  if (verificationFailed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-red-500/80 backdrop-blur-sm"
      >
        <motion.div 
          animate={{ rotate: [-10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <X className="w-16 h-16 text-white" />
        </motion.div>
      </motion.div>
    );
  }
  
  if (!cameraActive && !cameraLoading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
        <Camera className="w-12 h-12 text-white/50 mb-4" />
        <p className="text-white/70 text-center px-6">
          Camera access is required for facial verification.
          <br />
          Please grant permission to continue.
        </p>
      </div>
    );
  }
  
  if (cameraLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-primary" />
        </motion.div>
      </div>
    );
  }
  
  return null;
};

export default CameraStatusIndicator;
