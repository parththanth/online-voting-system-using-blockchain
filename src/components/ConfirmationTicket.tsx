import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Copy, Share2, Download, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface ConfirmationTicketProps {
  transactionId: string;
  timestamp: string;
  partyName: string;
  partyLogo: string;
}

const ConfirmationTicket = ({
  transactionId,
  timestamp,
  partyName,
  partyLogo,
}: ConfirmationTicketProps) => {
  const navigate = useNavigate();
  
  const formattedDate = new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
  
  const copyReceipt = () => {
    const receiptText = `
Vote Receipt
Transaction ID: ${transactionId}
Time: ${formattedDate}
Party voted for: ${partyName}
    `;
    
    navigator.clipboard.writeText(receiptText);
    toast.success("Receipt copied to clipboard");
  };
  
  useEffect(() => {
    const confetti = () => {
      const canvas = document.createElement("canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "100";
      document.body.appendChild(canvas);
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const colors = ["#FF9933", "#FFFFFF", "#138808"];
      const pieces = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        speed: Math.random() * 3 + 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
      }));
      
      let animationFrame: number;
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let finished = true;
        pieces.forEach((piece) => {
          piece.y += piece.speed;
          piece.rotation += piece.rotationSpeed;
          
          ctx.save();
          ctx.translate(piece.x, piece.y);
          ctx.rotate((piece.rotation * Math.PI) / 180);
          ctx.fillStyle = piece.color;
          ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
          ctx.restore();
          
          if (piece.y < canvas.height) {
            finished = false;
          }
        });
        
        if (!finished) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          canvas.remove();
        }
      };
      
      animate();
      
      return () => {
        cancelAnimationFrame(animationFrame);
        canvas.remove();
      };
    };
    
    const cleanup = confetti();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="mb-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
            <CheckCircle2 size={50} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Vote Successfully Cast!</h2>
        <p className="text-muted-foreground">
          Thank you for participating in the democratic process.
        </p>
      </motion.div>
      
      <Card className="border-2 border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Vote Receipt</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={copyReceipt}>
                <Copy size={16} />
              </Button>
              <Button variant="outline" size="icon">
                <Download size={16} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4 py-2 border-b border-border min-w-0">
              <div className="min-w-0">
                <div className="text-sm text-muted-foreground mb-1">Transaction ID</div>
                <div className="font-mono text-xs break-all overflow-hidden text-ellipsis max-w-[220px] sm:max-w-[360px]">{transactionId}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Time</div>
                <div className="text-sm flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
            
            <div className="py-3 border-b border-border">
              <div className="text-sm text-muted-foreground mb-1">Party voted for</div>
              <div className="flex items-center gap-3">
                <img src={partyLogo} alt={partyName} className="w-10 h-10 object-contain" />
                <span className="font-medium">{partyName}</span>
              </div>
            </div>
            
            <div className="pt-3">
              <div className="text-sm text-muted-foreground mb-4">
                This receipt is encrypted and stored on the blockchain. 
                It can be used as proof of your participation without revealing your vote choice.
              </div>
              
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs text-center">
                Your vote has been recorded in the blockchain with transaction ID: 
                <span className="font-mono font-medium block mt-1">
                  {transactionId.substring(0, 20)}...
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 flex justify-center">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="border border-primary/20 rounded-lg p-1 hover:bg-primary/5 transition-colors"
        >
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 px-4 py-2"
          >
            <span>Return to Home</span>
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ConfirmationTicket;
