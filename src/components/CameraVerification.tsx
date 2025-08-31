
import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserSearch } from "lucide-react";

import { useCamera } from "@/hooks/useCamera";
import { useFacialVerification } from "@/hooks/useFacialVerification";
import FaceScanningOverlay from "./FaceScanningOverlay";
import CameraStatusIndicator from "./camera/CameraStatusIndicator";
import VerificationActions from "./camera/VerificationActions";
import LivenessGuideButton from "./camera/LivenessGuideButton";
import CameraToggleButton from "./camera/CameraToggleButton";
import LivenessGuide from "./LivenessGuide";

interface CameraVerificationProps {
  onSuccess: () => void;
  onFailure: () => void;
}

const CameraVerification = ({ onSuccess, onFailure }: CameraVerificationProps) => {
  const [showGuide, setShowGuide] = useState(false);
  
  const {
    videoRef,
    cameraActive,
    cameraLoading, 
    cameraError,
    facingMode,
    enableCamera,
    toggleCameraFacing
  } = useCamera();
  
  const {
    isVerifying,
    verificationSuccess,
    verificationFailed,
    scanningProgress,
    startVerification,
    resetVerification
  } = useFacialVerification({ 
    videoRef, 
    onSuccess,
    onFailure 
  });

  const handleStartVerification = () => {
    if (cameraActive) {
      startVerification();
    } else {
      enableCamera();
    }
  };

  const handleRetry = () => {
    resetVerification();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-xl overflow-hidden shadow-lg border border-border bg-card"
        >
          {/* Camera view */}
          <div className="relative aspect-[4/3] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Camera toggle button */}
            {cameraActive && !cameraLoading && !isVerifying && !verificationSuccess && !verificationFailed && (
              <CameraToggleButton 
                onToggle={toggleCameraFacing} 
                disabled={isVerifying || !cameraActive} 
                facingMode={facingMode}
              />
            )}
            
            {/* Face scanning overlay */}
            <FaceScanningOverlay 
              isScanning={isVerifying && !verificationSuccess && !verificationFailed} 
              progress={scanningProgress} 
            />
            
            {/* Camera status indicators */}
            <CameraStatusIndicator 
              cameraActive={cameraActive}
              cameraLoading={cameraLoading}
              verificationSuccess={verificationSuccess}
              verificationFailed={verificationFailed}
            />
          </div>
          
          {/* Controls and instructions */}
          <div className="p-4">
            <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
              <UserSearch size={18} className="text-primary" />
              Facial Verification
            </h3>
            
            <VerificationActions 
              cameraActive={cameraActive}
              isVerifying={isVerifying}
              verificationSuccess={verificationSuccess}
              verificationFailed={verificationFailed}
              onStartVerification={handleStartVerification}
              onRetry={handleRetry}
              onSuccess={onSuccess}
              onFailure={onFailure}
              cameraError={cameraError}
            />
          </div>
        </motion.div>
        
        {/* Liveness Guide button */}
        <LivenessGuideButton onClick={() => setShowGuide(true)} />
      </div>
      
      {/* Conditional rendering of LivenessGuide */}
      {showGuide && (
        <LivenessGuide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
};

export default CameraVerification;
