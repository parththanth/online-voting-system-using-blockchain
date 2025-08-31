
import React from "react";
import { motion } from "framer-motion";
import { FlipHorizontal, SwitchCamera } from "lucide-react";

interface CameraToggleButtonProps {
  onToggle: () => void;
  disabled?: boolean;
  facingMode: "user" | "environment";
}

const CameraToggleButton: React.FC<CameraToggleButtonProps> = ({ 
  onToggle, 
  disabled = false,
  facingMode
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onToggle}
      disabled={disabled}
      className="absolute top-3 right-3 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm disabled:opacity-50"
      title={`Switch to ${facingMode === "user" ? "back" : "front"} camera`}
      aria-label={`Switch to ${facingMode === "user" ? "back" : "front"} camera`}
    >
      <SwitchCamera size={20} />
    </motion.button>
  );
};

export default CameraToggleButton;
