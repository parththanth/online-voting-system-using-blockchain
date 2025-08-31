import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PhoneNumberInput from '@/components/auth/PhoneNumberInput';
import OTPVerification from '@/components/auth/OTPVerification';
import { FaceEnrollmentStep } from '@/components/auth/FaceEnrollmentStep';
import { authService } from '@/services/authService';
import { toast } from 'sonner';


interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'phone' | 'otp' | 'face' | 'done';

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onOpenChange }) => {
  
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSendTime, setOtpSendTime] = useState<Date | null>(null);

  const validatePhoneNumber = (phone: string) => /^\d{10}$/.test(phone.trim());
  const formatPhoneDisplay = (phone: string) => `+91 ${phone.slice(0,3)}-${phone.slice(3,6)}-${phone.slice(6)}`;
  const getTimeSinceOTP = () => {
    if (!otpSendTime) return '';
    const diff = Math.floor((Date.now() - otpSendTime.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const min = Math.floor(diff / 60);
    const sec = diff % 60;
    return `${min}m ${sec}s ago`;
  };

  const handleRequestOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) return;
    setIsLoading(true);
    try {
      const res = await authService.requestOTP(phoneNumber);
      if (res.success) {
        setOtpSendTime(new Date());
        setStep('otp');
        toast.success('OTP sent successfully');
      } else {
        toast.error(res.error || 'Failed to send OTP');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
    try {
      const res = await authService.verifyOTP(phoneNumber, otp);
      if (res.success) {
        toast.success('Phone number verified successfully');
        setStep('face');
      } else {
        toast.error(res.error || 'Verification failed');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Get started</DialogTitle>
          <DialogDescription>Register or log in and enroll your face to vote securely.</DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <PhoneNumberInput
            phoneNumber={phoneNumber}
            onPhoneChange={(e) => setPhoneNumber(e.target.value)}
            onSubmit={handleRequestOTP}
            isLoading={isLoading}
            validatePhoneNumber={validatePhoneNumber}
          />
        )}

        {step === 'otp' && (
          <OTPVerification
            otp={otp}
            onOtpChange={setOtp}
            onVerify={handleVerifyOTP}
            onResend={handleRequestOTP}
            phoneNumber={phoneNumber}
            formatPhoneDisplay={formatPhoneDisplay}
            getTimeSinceOTP={getTimeSinceOTP}
            otpSendTime={otpSendTime}
            isLoading={isLoading}
          />
        )}


        {step === 'face' && (
          <FaceEnrollmentStep
            userId={userId}
            onEnrollmentComplete={() => {
              toast.success('🎉 Registration Complete! Face enrollment successful.');
              setStep('done');
            }}
          />
        )}

        {step === 'done' && (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 text-green-600">✓</div>
              </div>
              <h3 className="text-xl font-semibold text-green-700">Registration Complete!</h3>
              <p className="text-muted-foreground">
                Your account has been successfully set up with secure facial verification.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Phone verified</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Face enrolled</span>
                </div>
              </div>
            </div>
            
            <a 
              href="/voting" 
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Voting
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
