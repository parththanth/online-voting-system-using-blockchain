
import { motion } from "framer-motion";
import { Shield, Lock, Fingerprint, FileText, Database, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-display font-semibold mb-4">
              About E-Secure Voting
            </h1>
            <p className="text-muted-foreground text-lg">
              A secure, transparent, and modern blockchain-based digital voting system 
              designed to ensure election integrity and expand democratic participation.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl font-medium mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                E-Secure is on a mission to modernize the democratic process through technology
                while maintaining the highest standards of security, accessibility, and transparency.
              </p>
              <p className="text-muted-foreground mb-4">
                By leveraging blockchain technology, advanced encryption, and biometric authentication,
                we've created a voting platform that overcomes the limitations of traditional paper ballots
                while adding new layers of security and verification.
              </p>
              <p className="text-muted-foreground">
                Our system is designed to increase voter participation by making the process more
                accessible while simultaneously reducing the potential for fraud and ensuring that
                every legitimate vote is counted.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass border border-border rounded-2xl overflow-hidden"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-display text-4xl font-bold">E</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-2xl font-medium mb-10 text-center"
            >
              Key Technology Components
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {[
                {
                  icon: <Shield className="w-8 h-8 text-primary" />,
                  title: "Blockchain Ledger",
                  description: "Immutable and transparent record of all votes, ensuring they cannot be altered once cast."
                },
                {
                  icon: <Lock className="w-8 h-8 text-primary" />,
                  title: "End-to-End Encryption",
                  description: "AES-256 encryption protects voter data and ballots throughout the entire voting process."
                },
                {
                  icon: <Fingerprint className="w-8 h-8 text-primary" />,
                  title: "Biometric Authentication",
                  description: "Facial recognition technology verifies voter identity, preventing impersonation and fraud."
                },
                {
                  icon: <Database className="w-8 h-8 text-primary" />,
                  title: "Decentralized Storage",
                  description: "Vote data is distributed across multiple secure nodes to prevent tampering or data loss."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass border border-border rounded-xl p-6"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-2xl font-medium mb-6">The Voting Process</h2>
              
              <div className="space-y-8">
                {[
                  {
                    step: 1,
                    title: "Voter Registration & Authentication",
                    description: "Users register with their Voter ID and verify their identity through OTP authentication."
                  },
                  {
                    step: 2,
                    title: "Biometric Verification",
                    description: "Facial recognition technology matches the voter to their registered face to prevent fraud."
                  },
                  {
                    step: 3,
                    title: "Secure Ballot Casting",
                    description: "Voters select their candidate through an intuitive interface and confirm their choice."
                  },
                  {
                    step: 4,
                    title: "Blockchain Recording",
                    description: "The vote is encrypted, anonymized, and recorded on the blockchain with a verification hash."
                  },
                  {
                    step: 5,
                    title: "Receipt Generation",
                    description: "Voters receive a unique transaction hash that allows them to verify their vote was counted."
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">{step.step}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="glass border border-border rounded-2xl p-8"
            >
              <h2 className="text-2xl font-medium mb-6">Security & Compliance</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">ISO 27001 Certified</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system complies with international standards for information security management.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">GDPR Compliant</h3>
                    <p className="text-sm text-muted-foreground">
                      We follow strict data protection protocols to secure voter privacy and personal information.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Regularly Audited</h3>
                    <p className="text-sm text-muted-foreground">
                      Independent security experts conduct regular audits of our systems and blockchain implementation.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-secondary/50 p-4 rounded-lg">
                <FileText size={20} className="text-primary" />
                <p className="text-sm">
                  For detailed security information, view our{" "}
                  <a href="#" className="text-primary hover:underline">
                    Security Whitepaper
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;
