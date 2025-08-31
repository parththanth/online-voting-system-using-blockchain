
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Shield, ArrowRight } from "lucide-react";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  selectedParty: {
    id: string;
    name: string;
    symbol: string;
    color: string;
    logoPath: string;
  } | null;
};

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false,
  selectedParty 
}: ConfirmationModalProps) => {
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-background border border-border rounded-2xl overflow-hidden relative"
          >
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h3 className="text-xl font-medium">Confirm Your Vote</h3>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="rounded-full p-1 hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-4">
                  You are about to cast your vote for:
                </p>
                
                <div className="flex items-center justify-center mb-4">
                  {selectedParty?.logoPath && (
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center bg-white overflow-hidden"
                      style={{ border: `2px solid ${selectedParty?.color}` }}
                    >
                      <img 
                        src={selectedParty?.logoPath} 
                        alt={`${selectedParty?.name} logo`} 
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  )}
                </div>
                
                <h4 className="text-lg font-medium">{selectedParty?.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedParty?.symbol}</p>
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-primary mt-0.5" />
                  <div>
                    <h5 className="font-medium text-sm">Secure & Confidential</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your vote will be encrypted and securely recorded on the blockchain.
                      Your identity remains anonymous.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-2 border border-border rounded-lg hover:bg-secondary transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Vote</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
