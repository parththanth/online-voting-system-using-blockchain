import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartyCard from "@/components/PartyCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import MetaMaskConflictWarning from "@/components/MetaMaskConflictWarning";
import { votingService } from "@/services/votingService";
import { authService } from "@/services/authService";
import { getAuthToken } from "@/services/api";
import { toast } from "sonner";
import CameraVerification from "@/components/CameraVerification";
import OTPVerification from "@/components/auth/OTPVerification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Party = {
  id: string;
  name: string;
  symbol: string;
  color: string;
  logoPath: string;
};

const Voting = () => {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMetaMaskWarning, setShowMetaMaskWarning] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  // Post-confirmation verification & OTP fallback states
  const [pendingVote, setPendingVote] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSendTime, setOtpSendTime] = useState<Date | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const navigate = useNavigate();
  
  const parties: Party[] = [
    { 
      id: "PTY-001", 
      name: "Bharatiya Janata Party", 
      symbol: "Lotus", 
      color: "#FF9933", 
      logoPath: "/lovable-uploads/bd528e11-c547-4096-be22-973ccf0a7e69.png" 
    },
    { 
      id: "PTY-002", 
      name: "Indian National Congress", 
      symbol: "Hand", 
      color: "#0078D7", 
      logoPath: "/lovable-uploads/6d40bf13-e73a-4e1b-82fe-7c36e7663ad3.png" 
    },
    { 
      id: "PTY-003", 
      name: "Aam Aadmi Party", 
      symbol: "Broom", 
      color: "#019934", 
      logoPath: "/lovable-uploads/c1e1f869-b9f5-4251-9872-e4504191624a.png" 
    },
    { 
      id: "PTY-004", 
      name: "None of the Above", 
      symbol: "NOTA", 
      color: "#6B7280", 
      logoPath: "/lovable-uploads/893342f4-7eb9-4b71-9b23-dbd4445bf9a0.png" 
    }
  ];

  useEffect(() => {
    // Enhanced authentication check with debug logging
    console.log('Voting: Checking authentication status');
    const isVerified = authService.isVerified();
    const adminStatus = authService.isAdmin();
    
    // Check for both regular and admin tokens
    const regularToken = getAuthToken();
    const adminToken = localStorage.getItem('voteguard_admin_token');
    const hasToken = !!(regularToken || adminToken);
    
    console.log('Voting: Auth status:', { 
      isVerified, 
      hasToken, 
      hasRegularToken: !!regularToken,
      hasAdminToken: !!adminToken,
      isAdmin: adminStatus 
    });
    setIsAdmin(adminStatus);
    
    if (!isVerified || !hasToken) {
      console.log('Voting: User not authenticated, redirecting to auth');
      toast.error('Please complete authentication to access voting');
      navigate('/auth');
      return;
    }
    
    console.log('Voting: Authentication verified, user can vote');
    
    // Check for MetaMask conflicts with proper type checking
    const checkMetaMaskConflicts = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const providers = window.ethereum.providers;
        if (providers && Array.isArray(providers) && providers.length > 1) {
          console.log('Multiple wallet providers detected:', providers.length);
          setShowMetaMaskWarning(true);
        }
      }
    };
    
    checkMetaMaskConflicts();
  }, [navigate]);
  
  const handlePartySelect = (id: string) => {
    console.log('Voting: Party selected:', id);
    setSelectedParty(id);
  };
  
  const handleContinue = () => {
    if (!selectedParty) {
      toast.error('Please select a party first');
      return;
    }
    setIsModalOpen(true);
  };
  
  const handleVoteConfirm = () => {
    if (!selectedParty) {
      toast.error('No party selected');
      return;
    }
    // Trigger post-confirmation face verification
    setIsModalOpen(false);
    setPendingVote(true);
    setVerifyAttempts(0);
    setShowVerification(true);
  };

  const handleCastVoteAfterAuth = async () => {
    if (!selectedParty) return;

    const selectedPartyDetails = parties.find(party => party.id === selectedParty);
    if (!selectedPartyDetails) {
      toast.error('Selected party not found');
      return;
    }

    setIsLoading(true);

    const currentToken = getAuthToken();
    console.log('Voting: Current auth token present:', !!currentToken);

    try {
      console.log('Voting: Attempting to cast vote for:', selectedPartyDetails);
      const response = await votingService.castVote(selectedPartyDetails.id, selectedPartyDetails.name);
      console.log('Voting: Vote response received:', response);

      if (response.success) {
        const successMessage = response.isAdminTest
          ? 'Admin test vote cast successfully! You can vote again.'
          : 'Vote cast successfully!';
        toast.success(successMessage);

        localStorage.setItem('voteData', JSON.stringify({
          transactionId: response.transactionId,
          partyId: selectedParty,
          partyName: selectedPartyDetails.name,
          timestamp: new Date().toISOString(),
          isAdminTest: response.isAdminTest
        }));
        navigate('/confirmation');
      } else {
        console.error('Voting: Vote failed with response error:', response.error);
        toast.error(response.error || 'Failed to cast vote');
      }
    } catch (error: any) {
      console.error('Voting: Vote casting error details:', error);
      if (error.message === 'already_voted') {
        console.log('ℹ️ User already voted, redirecting to confirmation page');
        // Set default confirmation data for users who already voted
        localStorage.setItem('voteData', JSON.stringify({
          transactionId: 'PREV_VOTE_' + Date.now(),
          partyId: selectedParty,
          partyName: selectedPartyDetails.name,
          timestamp: new Date().toISOString(),
          alreadyVoted: true
        }));
        toast.success('Vote confirmation loaded');
        navigate('/confirmation');
      } else if (error.message?.includes('Authentication failed')) {
        toast.error('Your session has expired. Please log in again.');
        authService.logout();
        navigate('/auth');
      } else if (error.message?.includes('Invalid vote request')) {
        toast.error('There was a problem with your vote. Please try again.');
      } else {
        toast.error(error.message || 'Failed to cast vote. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setPendingVote(false);
    }
  };

  const formatPhoneDisplay = (phone: string) =>
    phone.replace(/(\d{2})(\d{5})(\d{3})/, '+$1 **** $3');

  const getTimeSinceOTP = () => {
    if (!otpSendTime) return '';
    const seconds = Math.floor((Date.now() - otpSendTime.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const startOtpFlow = async () => {
    const userPhone = localStorage.getItem('userPhone') || '';
    if (!userPhone) {
      toast.error('No phone number found for OTP.');
      return;
    }
    try {
      setIsOtpLoading(true);
      await authService.requestOTP(userPhone);
      setOtp('');
      setOtpSendTime(new Date());
      setShowOtp(true);
      toast.success('OTP sent for secondary verification');
    } catch (e: any) {
      toast.error(e.message || 'Failed to send OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const verifyOtpAndCast = async () => {
    const userPhone = localStorage.getItem('userPhone') || '';
    if (!userPhone) return;
    try {
      setIsOtpLoading(true);
      await authService.verifyOTP(userPhone, otp);
      setShowOtp(false);
      toast.success('OTP verified');
      await handleCastVoteAfterAuth();
    } catch (e: any) {
      toast.error(e.message || 'Invalid OTP, please try again');
    } finally {
      setIsOtpLoading(false);
    }
  };
  
  const closeModal = () => {
    console.log('Voting: Closing confirmation modal');
    setIsModalOpen(false);
  };
  
  const selectedPartyDetails = selectedParty 
    ? parties.find(party => party.id === selectedParty) || null
    : null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="flex-1 pt-32 pb-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-6">
          {showMetaMaskWarning && (
            <div className="max-w-4xl mx-auto mb-6">
              <MetaMaskConflictWarning />
            </div>
          )}
          
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-6"
            >
              <div className="glass border border-orange-200 rounded-xl p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/10 rounded-full p-2">
                    <ShieldCheck size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-orange-800">Admin Test Mode</h3>
                    <p className="text-sm text-orange-600">
                      You can vote multiple times for testing purposes. Test votes are tracked separately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-display font-semibold mb-3">
              Cast Your <span className="bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent">Vote</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select your preferred candidate or party from the options below.
              Your vote will be secured using blockchain technology.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass border border-border rounded-xl p-4 mb-8 flex items-center gap-3"
            >
              <div className="bg-primary/10 rounded-full p-2">
                <Info size={18} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your vote is anonymous and confidential. The blockchain records only that you voted, not who you voted for.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {parties.map((party, index) => (
                <PartyCard
                  key={party.id}
                  id={party.id}
                  name={party.name}
                  symbol={party.symbol}
                  color={party.color}
                  logoPath={party.logoPath}
                  selected={selectedParty === party.id}
                  onSelect={handlePartySelect}
                />
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                disabled={!selectedParty || isLoading}
                className={`
                  flex items-center justify-center gap-2 rounded-lg px-6 py-3 
                  transition-all duration-300 shadow-button
                  ${selectedParty && !isLoading
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white" 
                    : "bg-secondary text-muted-foreground cursor-not-allowed"}
                `}
              >
                <span>Continue to Confirm</span>
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
      
      <div className="py-6 border-t border-border bg-gradient-to-r from-orange-500/5 via-white/5 to-green-600/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck size={16} className="text-primary" />
            <span>Your vote is protected by end-to-end encryption and blockchain technology</span>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedParty={selectedPartyDetails}
        onConfirm={handleVoteConfirm}
        isLoading={isLoading}
      />

      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Facial Verification</DialogTitle>
            <DialogDescription>
              Please verify your identity to continue to vote confirmation.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <CameraVerification
              onSuccess={async () => {
                console.log('✅ Facial verification successful - proceeding with vote');
                setVerifyAttempts(0);
                setShowVerification(false);
                setFaceVerified(true);
                toast.success('Facial verification successful');
                // Immediately cast vote after successful verification with proper error handling
                try {
                  await handleCastVoteAfterAuth();
                  console.log('✅ Vote cast successfully, navigating to confirmation');
                } catch (error: any) {
                  console.error('❌ Error casting vote after facial verification:', error);
                  // Check if it's an "already voted" error and redirect anyway
                  if (error.message === 'already_voted') {
                    console.log('ℹ️ User already voted, redirecting to confirmation page');
                    // Set default confirmation data for users who already voted
                    localStorage.setItem('voteData', JSON.stringify({
                      transactionId: 'PREV_VOTE_' + Date.now(),
                      partyId: selectedParty,
                      partyName: parties.find(p => p.id === selectedParty)?.name || 'Previously voted',
                      timestamp: new Date().toISOString(),
                      alreadyVoted: true
                    }));
                    navigate('/confirmation');
                  } else {
                    toast.error('Failed to cast vote. Please try again.');
                  }
                }
              }}
              onFailure={async () => {
                const next = verifyAttempts + 1;
                setVerifyAttempts(next);
                if (next < 2) {
                  toast.error('Face verification failed. Please adjust lighting and try again.');
                  // Keep dialog open for retry
                } else {
                  setShowVerification(false);
                  toast.error('Verification failed twice. Switching to OTP verification.');
                  await startOtpFlow();
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOtp} onOpenChange={setShowOtp}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Secondary Verification</DialogTitle>
            <DialogDescription>
              Enter the OTP sent to your phone to confirm your vote.
            </DialogDescription>
          </DialogHeader>
          <OTPVerification
            otp={otp}
            onOtpChange={setOtp}
            onVerify={verifyOtpAndCast}
            onResend={startOtpFlow}
            phoneNumber={localStorage.getItem('userPhone') || ''}
            formatPhoneDisplay={formatPhoneDisplay}
            getTimeSinceOTP={getTimeSinceOTP}
            otpSendTime={otpSendTime}
            isLoading={isOtpLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Voting;
