
import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Tilt from "react-parallax-tilt";

interface PartyCardProps {
  id: string;
  name: string;
  symbol: string;
  color: string;
  logoPath: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

const PartyCard = ({ id, name, symbol, color, logoPath, selected, onSelect }: PartyCardProps) => {
  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      scale={1.05}
      transitionSpeed={1500}
      tiltReverse={true}
      className="h-full"
    >
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(id)}
        className={`
          relative h-full rounded-xl overflow-hidden transition-all duration-300 
          ${selected 
            ? "ring-2 ring-primary shadow-lg shadow-primary/20" 
            : "ring-1 ring-border hover:ring-primary/50 shadow-sm"}
        `}
        style={{ 
          background: selected 
            ? `linear-gradient(45deg, ${color}30, transparent)` 
            : "var(--background)" 
        }}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-center mb-4">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center bg-white shadow-sm overflow-hidden"
            >
              <motion.img 
                src={logoPath} 
                alt={name} 
                className="w-20 h-20 object-contain" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="font-medium mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">Symbol: {symbol}</p>
          </div>
          
          {selected && (
            <motion.div 
              className="absolute top-3 right-3 bg-white dark:bg-black rounded-full p-1 shadow-sm dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Check className="w-4 h-4 text-primary dark:text-white" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </Tilt>
  );
};

export default PartyCard;

