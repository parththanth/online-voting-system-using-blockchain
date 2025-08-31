
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";
import { useState } from "react";
import OnboardingModal from "@/components/home/OnboardingModal";
import { Button } from "@/components/ui/button";
const Index = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      
      <Footer />

      {/* Onboarding modal */}
      <OnboardingModal open={open} onOpenChange={setOpen} />

      {/* Floating CTA for quick access */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setOpen(true)}>Register / Login</Button>
      </div>
    </div>
  );
};

export default Index;
