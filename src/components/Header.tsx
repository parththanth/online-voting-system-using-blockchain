import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun, Shield, Check, Settings } from "lucide-react";
import { 
  letterAnimation, 
  letterHover, 
  saffronLetterAnimation, 
  whiteLetterAnimation, 
  greenLetterAnimation, 
  flagWaveAnimation
} from "@/lib/animations";
import { authService } from "@/services/authService";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  
  // Define the letters for the flag animation
  const saffronLetters = "Vo";
  const whiteLetters = "teG";
  const greenLetters = "uard";
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = () => {
      setIsAdmin(authService.isAdmin());
    };
    
    checkAdminStatus();
    
    // Listen for storage changes to update admin status
    const handleStorageChange = () => {
      checkAdminStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "py-4 glass shadow-md" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div 
            className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 via-white to-green-600 shadow-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.1 
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 8px rgba(255,153,51,0.6)",
              transition: { duration: 0.2 } 
            }}
          >
            <motion.div
              className="w-8 h-8 relative flex items-center justify-center"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative"
              >
                <Shield className="w-6 h-6 text-black" strokeWidth={2.5} />
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <Check className="w-3 h-3 text-black" strokeWidth={3} />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-display font-semibold tracking-tight"
          >
            <motion.div 
              className="flex"
              variants={flagWaveAnimation}
              initial="initial"
              animate="animate"
            >
              {Array.from(saffronLetters).map((letter, i) => (
                <motion.span
                  key={`saffron-${i}`}
                  variants={saffronLetterAnimation}
                  className="text-xl relative"
                  style={{ display: "inline-block" }}
                >
                  {letter}
                </motion.span>
              ))}
              
              {Array.from(whiteLetters).map((letter, i) => (
                <motion.span
                  key={`white-${i}`}
                  variants={whiteLetterAnimation}
                  className={`text-xl relative ${
                    i >= 2 ? "text-primary dark:text-primary" : ""
                  }`}
                  style={{ display: "inline-block" }}
                >
                  {letter}
                </motion.span>
              ))}
              
              {Array.from(greenLetters).map((letter, i) => (
                <motion.span
                  key={`green-${i}`}
                  variants={greenLetterAnimation}
                  className="text-xl text-primary dark:text-primary relative"
                  style={{ display: "inline-block" }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          {['', 'auth', 'about'].map((path, index) => (
            <motion.div
              key={path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Link 
                to={path === '' ? '/' : `/${path}`}
                className={`relative font-medium transition-colors duration-200 ${
                  isActive(path === '' ? '/' : `/${path}`) 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {path === '' ? 'Home' : path.charAt(0).toUpperCase() + path.slice(1)}
                {isActive(path === '' ? '/' : `/${path}`) && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Link to="/admin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                  aria-label="Admin Panel"
                  title="Admin Panel"
                >
                  <Settings size={18} />
                </motion.button>
              </Link>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary text-secondary-foreground transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
