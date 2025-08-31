import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import PhoneNumberInput from './auth/PhoneNumberInput';
import OTPVerification from './auth/OTPVerification';
import FaceVerificationStep from './auth/FaceVerificationStep';
import FaceEnrollmentPage from './FaceEnrollmentPage';

import { toastMessages } from '@/utils/toastMessages';

interface AuthFormProps {
  onVerificationSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onVerificationSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [activeTab, setActiveTab] = useState("phone");
  const [otpSendTime, setOtpSendTime] = useState<Date | null>(null);
  const [showFaceEnrollment, setShowFaceEnrollment] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [userNeedsEnrollment, setUserNeedsEnrollment] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const navigate = useNavigate();

  // Updated to validate Indian phone numbers (10 digits)
  const validatePhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const formatPhoneDisplay = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      // Format as: +91 98765 43210
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return phone;
  };

  const getTimeSinceOTP = (): string => {
    if (!otpSendTime) return '';
    const now = new Date();
    const diffMs = now.getTime() - otpSendTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }
    return `${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
  };

  const handlePhoneSubmit = async () => {
    console.log('🔥 Phone submit clicked with phone:', phoneNumber);
    
    if (!phoneNumber.trim()) {
      console.log('❌ Phone number is empty');
      toast.error(toastMessages.phoneNumberRequired());
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      console.log('❌ Phone number validation failed:', phoneNumber);
      toast.error(toastMessages.phoneNumberInvalid());
      return;
    }

    setIsLoading(true);
    console.log('✅ Starting phone submit process with:', phoneNumber);
    
    try {
      const result = await authService.requestOTP(phoneNumber);
      
      if (result.success) {
        setIsOTPSent(true);
        setOtpSendTime(new Date());
        setActiveTab("otp");
        
        // Show real OTP sent message
        toast.success('OTP sent to your phone number!', { duration: 5000 });
        console.log('🔥 OTP sent successfully via Twilio SMS');
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }
    } catch (error: unknown) {
      console.error('❌ Phone submit error caught:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('✅ Phone submit process completed');
    }
  };

  const handleOTPVerification = async () => {
    if (otp.length < 6) {
      toast.error(toastMessages.otpRequired());
      return;
    }

    setIsLoading(true);
    console.log('Starting OTP verification with:', { phoneNumber, otp });
    
    try {
      const result = await authService.verifyOTP(phoneNumber, otp);
      
      if (result.success) {
        toast.success(toastMessages.otpVerificationSuccess());
        
        // Store user info and token
        if (result.user?.id) {
          localStorage.setItem('userId', result.user.id);
          localStorage.setItem('userPhone', phoneNumber);
        }
        
        if (result.token) {
          localStorage.setItem('voteguard_auth_token', result.token);
        }
        
        // Proceed directly to face verification after OTP success
        console.log('OTP verified successfully, proceeding to face verification');
        setShowFaceEnrollment(false);
        setShowFaceVerification(true);
      } else {
        toast.error(result.error || 'OTP verification failed');
      }
    } catch (error: unknown) {
      console.error('OTP verification error:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFaceEnrollmentStatus = async (userId: string) => {
    console.log('Checking face enrollment status for user:', userId);
    
    try {
      const token = localStorage.getItem('voteguard_auth_token');
      console.log('Auth token found:', !!token);
      
      if (!token) {
        console.log('No auth token found, defaulting to enrollment');
        setUserNeedsEnrollment(true);
        setShowFaceEnrollment(true);
        return;
      }

      console.log('Making request to check-face-enrollment endpoint...');
      
      // Check if user has enrolled face data
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-face-enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Backend response not ok:', response.status, response.statusText);
        // Default to enrollment for new users
        console.log('Defaulting to face enrollment due to backend error');
        setUserNeedsEnrollment(true);
        setShowFaceEnrollment(true);
        return;
      }

      const result = await response.json();
      console.log('Face enrollment check result:', result);
      
      if (result.hasEnrollment) {
        console.log('User has face enrollment, going to verification');
        setShowFaceVerification(true);
      } else {
        console.log('User needs face enrollment, going to enrollment page');
        setUserNeedsEnrollment(true);
        setShowFaceEnrollment(true);
      }
    } catch (error) {
      console.error('Error checking face enrollment status:', error);
      // Default to enrollment for new users
      console.log('Defaulting to face enrollment due to error');
      console.log('Error occurred, defaulting to enrollment');
      setUserNeedsEnrollment(true);
      setShowFaceEnrollment(true);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits for Indian phone numbers
    const sanitized = value.replace(/[^\d]/g, '');
    setPhoneNumber(sanitized);
  };

  const handleResendOTP = async () => {
    setOtp('');
    await handlePhoneSubmit();
  };

  const handleFaceVerificationSuccess = () => {
    console.log('Face verification successful');
    if (onVerificationSuccess) {
      onVerificationSuccess();
    } else {
      navigate('/dashboard');
    }
  };

  const handleFaceVerificationFailure = () => {
    console.log('Face verification failed');
    toast.error('Face verification failed. Please try again.');
    setShowFaceVerification(false);
    setActiveTab("phone");
  };

  const handleFaceEnrollmentSuccess = () => {
    console.log('Face enrollment successful');
    toast.success('Face enrolled successfully! Now proceeding to verification...');
    setShowFaceEnrollment(false);
    setShowFaceVerification(true);
  };

  const handleFaceEnrollmentFailure = () => {
    console.log('Face enrollment failed');
    toast.error('Face enrollment failed. Please try again.');
    setShowFaceEnrollment(false);
    setActiveTab("phone");
  };

  const handleSkipFaceVerification = () => {
    console.log('Face verification skipped, proceeding to voting');
    toast.success('Authentication complete! You can set up facial verification later.');
    navigate('/voting');
    
    if (onVerificationSuccess) {
      onVerificationSuccess();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "otp" && !phoneNumber.trim()) {
      toast.error(toastMessages.phoneNumberRequired());
      setActiveTab("phone");
    }
  };

  // Show face enrollment step
  if (showFaceEnrollment) {
    return (
      <FaceEnrollmentPage
        onSuccess={handleFaceEnrollmentSuccess}
        onFailure={handleFaceEnrollmentFailure}
        isRequired={true}
      />
    );
  }

  // Show face verification step
  if (showFaceVerification) {
    return (
      <FaceVerificationStep
        onVerificationSuccess={handleFaceVerificationSuccess}
        onSkip={handleSkipFaceVerification}
        isRequired={false}
      />
    );
  }

  return (
    <Card className="w-[420px]">
      <CardHeader>
        <CardTitle>Secure Authentication</CardTitle>
        <CardDescription>
          {activeTab === "phone" 
            ? "Enter your registered phone number to receive an OTP."
            : "Enter the 6-digit code sent to your phone via SMS"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="otp">OTP</TabsTrigger>
          </TabsList>
          
          <TabsContent value="phone" className="space-y-4">
            <PhoneNumberInput
              phoneNumber={phoneNumber}
              onPhoneChange={handlePhoneChange}
              onSubmit={handlePhoneSubmit}
              isLoading={isLoading}
              validatePhoneNumber={validatePhoneNumber}
            />
          </TabsContent>
          
          <TabsContent value="otp" className="space-y-4">
            <OTPVerification
              otp={otp}
              onOtpChange={setOtp}
              onVerify={handleOTPVerification}
              onResend={handleResendOTP}
              phoneNumber={phoneNumber}
              formatPhoneDisplay={formatPhoneDisplay}
              getTimeSinceOTP={getTimeSinceOTP}
              otpSendTime={otpSendTime}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
