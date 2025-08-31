
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 md:pt-40 md:pb-32"
    >
      <div className="container mx-auto px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight mb-6"
        >
          Secure. Transparent.{" "}
          <span className="bg-gradient-to-r from-orange-500 via-blue-600 to-green-600 bg-clip-text text-transparent">
            Democratic.
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          A next-generation secure voting platform leveraging blockchain technology 
          to ensure the integrity and transparency of the democratic process.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/auth">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg px-6 py-3 flex items-center justify-center gap-2 shadow-button"
            >
              <span>Start Voting</span>
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          
          <Link to="/about">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="border border-border rounded-lg px-6 py-3 hover:bg-secondary transition-colors"
            >
              Learn More
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
