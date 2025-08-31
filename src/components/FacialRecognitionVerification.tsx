
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, X, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import * as faceapi from 'face-api.js';
import { 
  initializeFaceAPI, 
  loadAuthorizedFaceDescriptors, 
  recognizeFace,
  detectLiveness
} from '@/services/faceRecognitionService';

interface FacialRecognitionVerificationProps {
  onSuccess: () => void;
  onFailure: () => void;
  isRequired?: boolean;
}

const FacialRecognitionVerification: React.FC<FacialRecognitionVerificationProps> = ({
  onSuccess,
  onFailure,
  isRequired = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const previousFrameRef = useRef<ImageData | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [faceLabel, setFaceLabel] = useState('');
  const [livenessDetected, setLivenessDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize face recognition system
  const initializeSystem = useCallback(async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      // Initialize face-api.js
      const modelsLoaded = await initializeFaceAPI();
      if (!modelsLoaded) {
        throw new Error('Failed to load face recognition models');
      }
      
      // Load authorized face descriptors
      const authorizedDescriptors = await loadAuthorizedFaceDescriptors();
      if (!authorizedDescriptors) {
        throw new Error('Failed to load authorized face data');
      }
      
      // Create face matcher
      const matcher = new faceapi.FaceMatcher([authorizedDescriptors], 0.4);
      setFaceMatcher(matcher);
      
      // Start camera
      await startCamera();
      
      console.log('Facial recognition system initialized successfully');
    } catch (error) {
      console.error('Error initializing facial recognition:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize facial recognition');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Start camera stream
  const startCamera = async () => {
    try {
      // Try different camera constraints if the first one fails
      let stream: MediaStream;
      
      try {
        // Try with ideal constraints first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
      } catch (firstError) {
        console.warn('First camera attempt failed, trying basic constraints:', firstError);
        // Fallback to basic video constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Camera access denied. Please allow camera permissions and refresh.');
    }
  };

  // Start face detection loop
  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current || !faceMatcher) return;
    
    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current || !faceMatcher) return;
      
      try {
        // Perform face recognition
        const result = await recognizeFace(videoRef.current, faceMatcher);
        
        // Update state based on recognition result
        setConfidence(result.confidence);
        setFaceLabel(result.label);
        
        // Draw detection results on canvas
        drawDetectionResults(result);
        
        // Check for liveness (basic movement detection)
        checkLiveness();
        
        // Auto-verify if face is authorized and confidence is high
        if (result.isAuthorized && result.confidence >= 0.5 && !isVerified && !isVerifying) {
          console.log('Face verification successful - authorized user detected with confidence:', result.confidence);
          handleSuccessfulVerification();
        }
        
      } catch (error) {
        console.error('Error in face detection:', error);
      }
      
      // Continue detection loop
      animationFrameRef.current = requestAnimationFrame(detectFaces);
    };
    
    detectFaces();
  };

  // Draw detection results on canvas overlay
  const drawDetectionResults = (result: any) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (result.detection) {
      const { x, y, width, height } = result.detection.detection.box;
      
      // Draw face box
      ctx.strokeStyle = result.isAuthorized ? '#10b981' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label and confidence
      ctx.fillStyle = result.isAuthorized ? '#10b981' : '#ef4444';
      ctx.font = '16px Arial';
      const text = `${result.label} (${(result.confidence * 100).toFixed(1)}%)`;
      ctx.fillText(text, x, y - 10);
    }
  };

  // Basic liveness detection
  const checkLiveness = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get current frame data
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Check for movement compared to previous frame
    const isLive = detectLiveness(previousFrameRef.current, currentFrame);
    setLivenessDetected(isLive);
    
    // Store current frame as previous for next comparison
    previousFrameRef.current = currentFrame;
  };

  // Handle successful face verification with backend verification
  const handleSuccessfulVerification = async () => {
    if (isVerifying || isVerified) return; // Prevent multiple calls
    
    setIsVerifying(true);
    console.log('Starting backend facial verification process...');
    
    try {
      // Extract face descriptor from current video frame
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Get face descriptor from current frame using TinyFaceDetector
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection || !detection.descriptor) {
        throw new Error('Could not extract face descriptor from current frame');
      }

      // Get auth token from localStorage using correct key
      const token = localStorage.getItem('voteguard_auth_token');
      if (!token) {
        throw new Error('Authentication token not found. Please complete OTP verification first.');
      }

      // Send face descriptor to backend for verification
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-face-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          faceDescriptor: Array.from(detection.descriptor),
          imageData: null // Optional, we're using descriptor-based verification
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Backend face verification failed');
      }

      console.log('Backend verification successful:', result);
      
      setIsVerified(true);
      toast.success(`Face verification successful! Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      
      // Call success handler after shorter delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (error) {
      console.error('Backend verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Face verification failed');
      handleVerificationFailure();
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle verification failure
  const handleVerificationFailure = () => {
    setVerificationFailed(true);
    toast.error('Face verification failed. Unauthorized access attempt.');
    
    setTimeout(() => {
      onFailure();
    }, 2000);
  };

  // Cleanup function
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeSystem();
    return cleanup;
  }, [initializeSystem]);

  // Skip verification option (for testing)
  const handleSkipVerification = () => {
    if (!isRequired) {
      toast.info('Face verification skipped');
      onSuccess();
    }
  };

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            Verification Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-2">
            <Button onClick={initializeSystem} className="flex-1">
              Retry
            </Button>
            {!isRequired && (
              <Button variant="outline" onClick={handleSkipVerification} className="flex-1">
                Skip
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera size={20} />
          Face Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Feed */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          
          {/* Loading Overlay */}
          <AnimatePresence>
            {isInitializing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading face recognition...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Success Overlay */}
          <AnimatePresence>
            {isVerified && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-green-500/80 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: 2, duration: 0.5 }}
                  >
                    <Check className="w-16 h-16 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-lg font-semibold">Verified: {faceLabel}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Failure Overlay */}
          <AnimatePresence>
            {verificationFailed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-red-500/80 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <X className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Access Denied</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Status Information */}
        {!isInitializing && !isVerified && !verificationFailed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Confidence:</span>
              <span className={confidence >= 0.5 ? 'text-green-600' : 'text-red-600'}>
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Liveness:</span>
              <span className={livenessDetected ? 'text-green-600' : 'text-yellow-600'}>
                {livenessDetected ? (
                  <><Eye size={16} className="inline mr-1" />Detected</>
                ) : (
                  <><EyeOff size={16} className="inline mr-1" />Move slightly</>
                )}
              </span>
            </div>
            {faceLabel && (
              <div className="flex items-center justify-between text-sm">
                <span>Status:</span>
                <span className={faceLabel === 'Fezan' ? 'text-green-600' : 'text-red-600'}>
                  {faceLabel}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Instructions */}
        {!isInitializing && !isVerified && !verificationFailed && (
          <p className="text-xs text-muted-foreground text-center">
            Position your face in the frame. Move slightly to confirm liveness.
            Verification will automatically complete when your face is recognized.
          </p>
        )}
        
        {/* Skip Button (for testing) */}
        {!isRequired && !isVerified && !verificationFailed && (
          <Button 
            variant="outline" 
            onClick={handleSkipVerification}
            className="w-full"
          >
            Skip Verification (Testing)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FacialRecognitionVerification;
