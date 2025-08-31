import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, AlertCircle, SkipForward } from 'lucide-react';
import CameraVerification from '@/components/CameraVerification';

interface FaceVerificationStepProps {
  onVerificationSuccess: () => void;
  onSkip?: () => void;
  isRequired?: boolean;
}

const FaceVerificationStep: React.FC<FaceVerificationStepProps> = ({
  onVerificationSuccess,
  onSkip,
  isRequired = false
}) => {
  const [showVerification, setShowVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleSuccess = () => {
    setVerificationStatus('success');
    setTimeout(() => {
      onVerificationSuccess();
    }, 1500);
  };

  const handleFailure = () => {
    setVerificationStatus('failed');
    setTimeout(() => {
      setVerificationStatus('idle');
    }, 3000);
  };

  if (showVerification) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera size={20} className="text-primary" />
              Facial Verification
            </CardTitle>
            <CardDescription>
              Please position your face in the camera and wait for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-700 mb-2">
                  Verification Successful!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your identity has been verified. Redirecting...
                </p>
              </motion.div>
            )}
            
            {verificationStatus === 'failed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-700 mb-2">
                  Verification Failed
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please try again or ensure good lighting and clear face visibility.
                </p>
              </motion.div>
            )}
            
            {verificationStatus === 'idle' && (
              <CameraVerification
                onSuccess={handleSuccess}
                onFailure={handleFailure}
              />
            )}
            
            {!isRequired && verificationStatus === 'idle' && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-muted-foreground"
                >
                  <SkipForward size={16} className="mr-2" />
                  Skip for now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera size={20} className="text-primary" />
            Facial Verification Setup
          </CardTitle>
          <CardDescription>
            Complete your authentication with facial verification for enhanced security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Camera size={32} className="text-primary" />
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Why facial verification?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enhanced account security</li>
                <li>• Prevent unauthorized access</li>
                <li>• Quick and seamless verification</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => setShowVerification(true)}
                className="w-full"
              >
                Start Facial Verification
              </Button>
              
              {!isRequired && onSkip && (
                <Button
                  variant="outline"
                  onClick={onSkip}
                  className="w-full"
                >
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FaceVerificationStep;