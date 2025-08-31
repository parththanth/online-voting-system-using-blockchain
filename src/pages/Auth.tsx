
import { motion } from "framer-motion";
import { Lock, Shield, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl font-display font-semibold mb-3">
                Voter Authentication
              </h1>
              <p className="text-muted-foreground">
                Secure login using your phone number and OTP verification
              </p>
            </motion.div>
            
            <div className="lg:flex gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:w-1/2 mb-8 lg:mb-0"
              >
                <h2 className="text-2xl font-medium mb-6">Secure Authentication Process</h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Smartphone size={16} className="text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone Identification</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your registered phone number to begin the authentication process.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lock size={16} className="text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">SMS Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        A one-time password will be sent via SMS to your phone number.
                      </p>
                    </div>
                  </div>
                  
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:w-1/2"
              >
                <AuthForm />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Auth;
