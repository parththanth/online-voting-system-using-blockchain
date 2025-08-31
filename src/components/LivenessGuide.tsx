
import { motion } from "framer-motion";
import { Eye, RotateCw, MoveHorizontal, AlertTriangle } from "lucide-react";

interface LivenessGuideProps {
  onClose: () => void;
}

const LivenessGuide = ({ onClose }: LivenessGuideProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-background rounded-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Liveness Detection Guide</h2>
        
        <div className="text-sm text-muted-foreground mb-4 text-center">
          To ensure security, please follow these guidelines during facial verification:
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Eye size={18} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Blink Naturally</h3>
              <p className="text-xs text-muted-foreground">
                The system will detect natural eye blinks to verify you're a real person.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <RotateCw size={18} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Turn Head Slightly</h3>
              <p className="text-xs text-muted-foreground">
                When prompted, slightly turn your head left and right to verify three-dimensionality.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <MoveHorizontal size={18} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Keep Your Face Centered</h3>
              <p className="text-xs text-muted-foreground">
                Ensure your face remains within the circular guide for accurate verification.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-medium">Important:</span> Using a photo, video, or mask of another person 
            is election fraud and a criminal offense. All verification attempts are monitored and recorded.
          </div>
        </div>
        
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
            onClick={onClose}
          >
            I Understand
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LivenessGuide;
