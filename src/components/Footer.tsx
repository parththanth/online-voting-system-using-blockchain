
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Shield, HelpCircle, ChevronRight } from "lucide-react";
import { fadeIn } from "@/lib/animations";

const Footer = () => {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "hi" : "en");
  };
  
  const content = {
    en: {
      about: "About",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      help: "Help & Support",
      compliance: "Election Commission Compliance",
      rights: "© 2023 VoteGuard. All rights reserved.",
      poweredBy: "Secured by Blockchain technology",
      eci: "In compliance with Election Commission of India guidelines",
      language: "हिन्दी में देखें",
    },
    hi: {
      about: "हमारे बारे में",
      terms: "सेवा की शर्तें",
      privacy: "गोपनीयता नीति",
      help: "सहायता और समर्थन",
      compliance: "चुनाव आयोग अनुपालन",
      rights: "© 2023 वोटगार्ड। सर्वाधिकार सुरक्षित।",
      poweredBy: "ब्लॉकचेन तकनीक द्वारा सुरक्षित",
      eci: "भारत के चुनाव आयोग के दिशानिर्देशों के अनुपालन में",
      language: "View in English",
    }
  };
  
  const termsContent = {
    en: `<h2>Terms of Service</h2>
<p>Last Updated: May 15, 2023</p>
<p>These Terms of Service ("Terms") govern your access to and use of the VoteGuard platform ("Platform"). By accessing or using the Platform, you agree to be bound by these Terms.</p>

<h3>1. Eligibility</h3>
<p>You must be a registered voter in India to use this Platform. You represent and warrant that you meet all eligibility requirements to vote in the relevant election.</p>

<h3>2. Account Security</h3>
<p>You are responsible for maintaining the confidentiality of your authentication credentials. You agree to notify us immediately of any unauthorized access to your account.</p>

<h3>3. Voting Process</h3>
<p>The Platform uses facial verification and digital authentication to verify your identity. Your vote is confidential and encrypted to maintain your privacy.</p>

<h3>4. Data Privacy</h3>
<p>We collect and process your personal information in accordance with our Privacy Policy. By using the Platform, you consent to such processing.</p>

<h3>5. Prohibited Activities</h3>
<p>You agree not to:</p>
<ul>
<li>Attempt to bypass or tamper with the Platform's security features</li>
<li>Submit false or misleading information</li>
<li>Attempt to vote more than once</li>
<li>Use the Platform on behalf of another person</li>
<li>Interfere with the proper working of the Platform</li>
</ul>

<h3>6. Changes to Terms</h3>
<p>We may modify these Terms at any time. Your continued use of the Platform after any changes constitutes acceptance of the modified Terms.</p>

<h3>7. Governing Law</h3>
<p>These Terms shall be governed by the laws of India, without regard to its conflict of law provisions.</p>`,
    hi: `<h2>सेवा की शर्तें</h2>
<p>अंतिम अद्यतन: 15 मई, 2023</p>
<p>ये सेवा की शर्तें ("शर्तें") VoteGuard प्लेटफॉर्म ("प्लेटफॉर्म") तक आपकी पहुंच और उपयोग को नियंत्रित करती हैं। प्लेटफॉर्म का उपयोग करके या उस तक पहुंच करके, आप इन शर्तों से बाध्य होने के लिए सहमत होते हैं।</p>

<h3>1. पात्रता</h3>
<p>इस प्लेटफॉर्म का उपयोग करने के लिए आपको भारत में पंजीकृत मतदाता होना चाहिए। आप प्रतिनिधित्व करते हैं और वारंट देते हैं कि आप संबंधित चुनाव में मतदान करने के लिए सभी पात्रता आवश्यकताओं को पूरा करते हैं।</p>

<h3>2. खाता सुरक्षा</h3>
<p>आप अपनी प्रमाणीकरण क्रेडेंशियल्स की गोपनीयता बनाए रखने के लिए जिम्मेदार हैं। आप अपने खाते तक किसी भी अनधिकृत पहुंच के बारे में हमें तुरंत सूचित करने के लिए सहमत हैं।</p>

<h3>3. मतदान प्रक्रिया</h3>
<p>प्लेटफॉर्म आपकी पहचान सत्यापित करने के लिए चेहरे के सत्यापन और डिजिटल प्रमाणीकरण का उपयोग करता है। आपका वोट गोपनीय है और आपकी निजता बनाए रखने के लिए एन्क्रिप्टेड है।</p>

<h3>4. डेटा गोपनीयता</h3>
<p>हम अपनी गोपनीयता नीति के अनुसार आपकी व्यक्तिगत जानकारी एकत्र और संसाधित करते हैं। प्लेटफॉर्म का उपयोग करके, आप ऐसी प्रसंस्करण के लिए सहमति देते हैं।</p>

<h3>5. निषिद्ध गतिविधियां</h3>
<p>आप सहमत हैं कि:</p>
<ul>
<li>प्लेटफॉर्म की सुरक्षा विशेषताओं को बायपास या छेड़छाड़ करने का प्रयास न करें</li>
<li>झूठी या भ्रामक जानकारी न दें</li>
<li>एक से अधिक बार मतदान करने का प्रयास न करें</li>
<li>दूसरे व्यक्ति की ओर से प्लेटफॉर्म का उपयोग न करें</li>
<li>प्लेटफॉर्म के उचित कामकाज में हस्तक्षेप न करें</li>
</ul>

<h3>6. शर्तों में परिवर्तन</h3>
<p>हम किसी भी समय इन शर्तों को संशोधित कर सकते हैं। किसी भी परिवर्तन के बाद प्लेटफॉर्म का आपका निरंतर उपयोग संशोधित शर्तों की स्वीकृति का प्रतिनिधित्व करता है।</p>

<h3>7. शासी कानून</h3>
<p>ये शर्तें भारत के कानूनों द्वारा शासित होंगी, इसके कानूनी प्रावधानों के संघर्ष के बावजूद।</p>`
  };
  
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur-sm">
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto py-8 px-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">VoteGuard</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {language === "en" ? 
                "Secure, transparent and accessible voting platform powered by blockchain technology." :
                "ब्लॉकचेन तकनीक द्वारा संचालित सुरक्षित, पारदर्शी और सुलभ मतदान प्लेटफॉर्म।"
              }
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Shield size={16} />
              <span>{content[language].poweredBy}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">{language === "en" ? "Links" : "लिंक"}</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1">
                  <ChevronRight size={12} />
                  <span>{content[language].about}</span>
                </a>
              </li>
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1">
                      <ChevronRight size={12} />
                      <span>{content[language].terms}</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{content[language].terms}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-96">
                      <div className="p-4 prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: termsContent[language] }} />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1">
                  <ChevronRight size={12} />
                  <span>{content[language].privacy}</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1">
                  <ChevronRight size={12} />
                  <span>{content[language].help}</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">{language === "en" ? "Compliance" : "अनुपालन"}</h3>
            <p className="text-muted-foreground text-sm mb-4">{content[language].eci}</p>
            
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
            >
              <Globe size={14} />
              <span>{content[language].language}</span>
            </button>
            
            <p className="text-xs text-muted-foreground mt-4">{content[language].rights}</p>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
