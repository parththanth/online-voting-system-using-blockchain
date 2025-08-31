
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="glass border border-border rounded-2xl overflow-hidden"
        >
          <div className="lg:flex">
            <div className="p-10 lg:p-16 lg:w-2/3">
              <h2 className="text-3xl font-display font-semibold mb-4">
                Ready to Experience Secure Digital Voting?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl">
                Join millions of voters who trust VoteGuard for secure, 
                transparent, and accessible democratic participation.
              </p>
              
              <Link to="/auth">
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg px-6 py-3 flex items-center justify-center gap-2 shadow-button"
                >
                  <span>Start the Process</span>
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
            </div>
            
            <div className="lg:w-1/3 bg-gradient-to-br from-orange-500/10 via-white/10 to-green-600/10 flex items-center justify-center p-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="w-full h-full flex items-center justify-center"
              >
                <img 
                  src="/lovable-uploads/f7781719-a512-4751-a903-e45289b1d07e.png" 
                  alt="Indian Flag"
                  className="max-w-full max-h-full object-contain shadow-lg rounded-md"
                  style={{ width: 'auto', maxHeight: '180px' }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
