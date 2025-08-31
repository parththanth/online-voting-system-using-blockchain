
import React from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { CardFooter } from '../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { RotateCw } from 'lucide-react';

interface OTPVerificationProps {
  otp: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  phoneNumber: string;
  formatPhoneDisplay: (phone: string) => string;
  getTimeSinceOTP: () => string;
  otpSendTime: Date | null;
  isLoading: boolean;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  otp,
  onOtpChange,
  onVerify,
  onResend,
  phoneNumber,
  formatPhoneDisplay,
  getTimeSinceOTP,
  otpSendTime,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label htmlFor="otp">OTP Code</Label>
        {phoneNumber ? (
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to {formatPhoneDisplay(phoneNumber)}
            {otpSendTime && (
              <span className="block mt-1">Sent {getTimeSinceOTP()}</span>
            )}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Please enter your phone number first to receive an OTP
          </p>
        )}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={onOtpChange} disabled={isLoading || !phoneNumber}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          The code will expire in 5 minutes
        </p>
        <p className="text-xs text-blue-600 text-center">
          Check your phone for the SMS with your verification code
        </p>
      </div>
      
      <CardFooter className="justify-between pt-4 px-0">
        <Button 
          variant="link" 
          size="sm"
          onClick={onResend}
          disabled={isLoading || !phoneNumber}
        >
          Resend OTP
        </Button>
        <Button 
          onClick={onVerify} 
          disabled={isLoading || otp.length < 6 || !phoneNumber}
          className="min-w-[100px]"
        >
          {isLoading ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : null}
          Verify OTP
        </Button>
      </CardFooter>
    </div>
  );
};

export default OTPVerification;
