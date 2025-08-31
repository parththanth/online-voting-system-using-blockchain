
import { motion } from "framer-motion";
import { Shield, Lock, Layers } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Secure Authentication",
      description: "Multi-factor authentication ensures only eligible voters participate, preventing fraud."
    },
    {
      icon: <Lock className="w-8 h-8 text-primary" />,
      title: "Encrypted Ballots",
      description: "Every vote is encrypted and anonymized before being added to the blockchain ledger."
    },
    {
      icon: <Layers className="w-8 h-8 text-primary" />,
      title: "Immutable Records",
      description: "Blockchain technology creates a tamper-proof record of every vote that can be verified."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-secondary/30 to-secondary/70">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-display font-semibold mb-4">Why Choose VoteGuard?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our platform combines cutting-edge technology with a user-friendly interface 
            to create the most secure voting experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass border border-border rounded-2xl p-6 h-full"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
