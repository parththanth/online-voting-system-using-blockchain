
import React from "react";
import { motion } from "framer-motion";
import { ScanFace, Camera, RefreshCcw, Key, CheckCircle } from "lucide-react";

interface VerificationActionsProps {
  cameraActive: boolean;
  isVerifying: boolean;
  verificationSuccess: boolean;
  verificationFailed: boolean;
  onStartVerification: () => void;
  onRetry: () => void;
  onSuccess: () => void;
  onFailure: () => void;
  cameraError: string | null;
}

const VerificationActions: React.FC<VerificationActionsProps> = ({
  cameraActive,
  isVerifying,
  verificationSuccess,
  verificationFailed,
  onStartVerification,
  onRetry,
  onSuccess,
  onFailure,
  cameraError
}) => {
  if (verificationSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-3 rounded-md text-sm mb-3">
          <p>Face verification successful!</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSuccess}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Continue</span>
        </motion.button>
      </motion.div>
    );
  }
  
  if (verificationFailed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md text-sm mb-3">
          <p>Face verification failed. Please try again or use an alternative method.</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-md font-medium flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Try Again</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onFailure}
            className="flex-1 bg-primary text-primary-foreground py-2 rounded-md font-medium flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>Use OTP</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }
  
  if (!isVerifying && !verificationSuccess && !verificationFailed) {
    return (
      <>
        {cameraError ? (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md text-sm mb-3">
            <p>{cameraError}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm mb-3">
            {isVerifying
              ? "Hold still while we verify your face..."
              : "Position your face in the frame and click Verify"}
          </p>
        )}
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Verify Face button clicked', { cameraActive, isVerifying });
            onStartVerification();
          }}
          disabled={!cameraActive || isVerifying}
          className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-primary/90 active:bg-primary/80 transition-colors duration-200 cursor-pointer"
          type="button"
        >
          {cameraActive ? (
            <>
              <ScanFace className="w-4 h-4" />
              <span>Verify Face</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Enable Camera</span>
            </>
          )}
        </button>
      </>
    );
  }
  
  return null;
};

export default VerificationActions;
