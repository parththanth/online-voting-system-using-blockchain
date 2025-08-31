
import React from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

interface LivenessGuideButtonProps {
  onClick: () => void;
}

const LivenessGuideButton: React.FC<LivenessGuideButtonProps> = ({ onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-6"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full py-2 px-4 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
      >
        <Eye size={16} />
        <span>View Liveness Detection Guide</span>
      </motion.button>
    </motion.div>
  );
};

export default LivenessGuideButton;
