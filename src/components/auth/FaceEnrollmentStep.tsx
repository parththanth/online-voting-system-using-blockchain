import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SimpleFaceEnrollment from '@/components/SimpleFaceEnrollment';
import { faceEnrollmentService } from '@/services/faceEnrollmentService';

interface FaceEnrollmentStepProps {
  userId: string;
  onEnrollmentComplete: () => void;
  onSkip?: () => void;
}

export const FaceEnrollmentStep: React.FC<FaceEnrollmentStepProps> = ({
  userId,
  onEnrollmentComplete,
  onSkip
}) => {
  const [showEnrollment, setShowEnrollment] = useState(false);

  const handleSuccess = async (faceDescriptors: number[][]) => {
    console.log('Face enrollment successful for user:', userId, 'descriptors:', faceDescriptors.length);
    
    try {
      // Save the face enrollment to the backend
      const result = await faceEnrollmentService.enrollFaceMultiple(
        userId,
        faceDescriptors,
        undefined, // enrolledBy - let the service handle this
        0.6 // confidence threshold
      );

      if (result.success) {
        console.log('✅ Face enrollment saved to backend successfully');
        onEnrollmentComplete();
      } else {
        console.error('❌ Failed to save face enrollment:', result.error);
        // Still proceed with onboarding even if backend save fails
        onEnrollmentComplete();
      }
    } catch (error) {
      console.error('❌ Error saving face enrollment:', error);
      // Still proceed with onboarding even if there's an error
      onEnrollmentComplete();
    }
  };

  if (showEnrollment) {
    return (
      <SimpleFaceEnrollment
        userId={userId}
        onSuccess={handleSuccess}
        onSkip={onSkip || (() => onEnrollmentComplete())}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center space-y-6"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="space-y-4">
          <UserPlus className="w-16 h-16 mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Set Up Face Verification</h3>
          <p className="text-muted-foreground">
            For enhanced security, we recommend setting up face verification. 
            This will allow you to quickly and securely access your account.
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-left space-y-2">
            <h4 className="font-medium text-sm">Benefits:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Quick and secure authentication</li>
              <li>• Enhanced account protection</li>
              <li>• Seamless voting experience</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3" style={{ position: 'relative', zIndex: 10 }}>
          <Button 
            onClick={() => setShowEnrollment(true)} 
            className="w-full relative z-10"
            style={{ pointerEvents: 'auto', transform: 'none' }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Set Up Face Verification
          </Button>
          
          {onSkip && (
            <Button 
              variant="outline" 
              onClick={onSkip} 
              className="w-full relative z-10"
              style={{ pointerEvents: 'auto', transform: 'none' }}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Without Face Verification
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          You can set this up later in your account settings
        </p>
      </motion.div>
    </Card>
  );
};