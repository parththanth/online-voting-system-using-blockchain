
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CardFooter } from '../ui/card';
import { RotateCw, AlertCircle } from 'lucide-react';

interface PhoneNumberInputProps {
  phoneNumber: string;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  validatePhoneNumber: (phone: string) => boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  phoneNumber,
  onPhoneChange,
  onSubmit,
  isLoading,
  validatePhoneNumber
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="9876543210"
          value={phoneNumber}
          onChange={onPhoneChange}
          className={!validatePhoneNumber(phoneNumber) && phoneNumber.length > 0 ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {!validatePhoneNumber(phoneNumber) && phoneNumber.length > 0 && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Please enter a valid 10-digit Indian phone number
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Enter your 10-digit Indian mobile number (e.g., 9876543210)
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
          <p className="text-xs text-green-700">
            <strong>SMS Enabled:</strong> You will receive a real OTP on your mobile phone via SMS.
          </p>
        </div>
      </div>
      
      <CardFooter className="justify-between pt-4 px-0">
        <Button variant="link" size="sm">Need Help?</Button>
        <Button 
          onClick={onSubmit} 
          disabled={isLoading || !validatePhoneNumber(phoneNumber) || !phoneNumber.trim()}
          className="min-w-[100px]"
        >
          {isLoading ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : null}
          Send OTP
        </Button>
      </CardFooter>
    </div>
  );
};

export default PhoneNumberInput;
