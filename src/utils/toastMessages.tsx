
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const toastMessages = {
  otpSentSuccess: (debugOtp?: string) => (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>OTP sent to your phone successfully!</span>
    </div>
  ),

  otpSentRegular: () => (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>OTP sent to your phone!</span>
    </div>
  ),

  otpVerificationSuccess: () => (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span>✅ OTP verified successfully! Authentication complete!</span>
    </div>
  ),

  otpExpired: () => (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>OTP has expired. Please request a new one.</span>
    </div>
  ),

  otpIncorrect: () => (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>❌ INCORRECT OTP! The code you entered is wrong.</span>
    </div>
  ),

  otpVerificationFailed: (errorMessage: string) => (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>❌ OTP verification failed: {errorMessage}</span>
    </div>
  ),

  otpVerificationError: () => (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>❌ OTP verification failed. Please try again.</span>
    </div>
  ),

  phoneNumberRequired: () => 'Please enter a phone number',
  phoneNumberInvalid: () => 'Please enter a valid 10-digit phone number',
  otpRequired: () => 'Please enter a valid 6-digit OTP',
  tooManyAttempts: () => (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>Too many attempts. Please try again later.</span>
    </div>
  ),
  phoneNotFound: () => (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>Phone number not found. Please check your number and try again.</span>
    </div>
  ),
  serverError: () => (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>Server error occurred. Please try again or contact support.</span>
    </div>
  ),
  networkError: () => (
    <div className="flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-500" />
      <span>Failed to send OTP. Please check your phone number and try again.</span>
    </div>
  )
};
