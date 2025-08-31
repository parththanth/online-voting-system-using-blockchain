import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, X, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import * as faceapi from 'face-api.js';
import { initializeFaceAPI, detectLiveness } from '@/services/faceRecognitionService';

interface FaceEnrollmentPageProps {
  onSuccess: () => void;
  onFailure: () => void;
  isRequired?: boolean;
}

const FaceEnrollmentPage: React.FC<FaceEnrollmentPageProps> = ({
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
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentFailed, setEnrollmentFailed] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [livenessDetected, setLivenessDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedDescriptors, setCapturedDescriptors] = useState<number[][]>([]);

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
      
      // Start camera
      await startCamera();
      
      console.log('Face enrollment system initialized successfully');
    } catch (error) {
      console.error('Error initializing face enrollment:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize face enrollment');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Start camera stream
  const startCamera = async () => {
    try {
      let stream: MediaStream;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
      } catch (firstError) {
        console.warn('First camera attempt failed, trying basic constraints:', firstError);
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
    if (!videoRef.current || !canvasRef.current) return;
    
    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      try {
        // Detect face with descriptor using TinyFaceDetector
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        if (detection) {
          setFaceDetected(true);
          setConfidence(detection.detection.score);
          
          // Draw detection results
          drawDetectionResults(detection);
          
          // Check for liveness
          checkLiveness();
          
          // Auto-capture if conditions are good
          if (detection.detection.score >= 0.7 && livenessDetected && !isEnrolling && !isEnrolled) {
            console.log('Good face detected, ready for enrollment');
          }
        } else {
          setFaceDetected(false);
          setConfidence(0);
          clearCanvas();
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
  const drawDetectionResults = (detection: any) => {
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
    
    if (detection) {
      const { x, y, width, height } = detection.detection.box;
      
      // Draw face box - green if good quality, yellow if ok, red if poor
      const quality = detection.detection.score;
      let color = '#ef4444'; // red
      if (quality >= 0.7) color = '#10b981'; // green
      else if (quality >= 0.5) color = '#f59e0b'; // yellow
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw quality indicator
      ctx.fillStyle = color;
      ctx.font = '16px Arial';
      const text = `Quality: ${(quality * 100).toFixed(1)}%`;
      ctx.fillText(text, x, y - 10);
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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

  // Handle face enrollment
  const handleEnrollment = async () => {
    if (isEnrolling || isEnrolled || !faceDetected) return;
    
    setIsEnrolling(true);
    console.log('Starting face enrollment process...');
    
    try {
      if (!videoRef.current) {
        throw new Error('Video element not available');
      }

      // Capture multiple face descriptors for better accuracy
      const descriptors: number[][] = [];
      
      for (let i = 0; i < 3; i++) {
        // Wait a bit between captures
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection && detection.descriptor) {
          descriptors.push(Array.from(detection.descriptor));
          console.log(`Captured descriptor ${i + 1}/3`);
        }
      }

      if (descriptors.length === 0) {
        throw new Error('Could not capture face descriptors');
      }

      // Get auth token and user ID
      const token = localStorage.getItem('voteguard_auth_token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('Authentication required. Please complete OTP verification first.');
      }

      // Send descriptors to backend for enrollment
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/face-enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          faceDescriptors: descriptors,
          confidenceThreshold: 0.6
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Face enrollment failed');
      }

      console.log('Face enrollment successful:', result);
      
      setIsEnrolled(true);
      toast.success(`Face enrolled successfully! Captured ${descriptors.length} samples.`);
      
      // Call success handler after delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('Face enrollment error:', error);
      toast.error(error instanceof Error ? error.message : 'Face enrollment failed');
      handleEnrollmentFailure();
    } finally {
      setIsEnrolling(false);
    }
  };

  // Handle enrollment failure
  const handleEnrollmentFailure = () => {
    setEnrollmentFailed(true);
    toast.error('Face enrollment failed. Please try again.');
    
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

  // Skip enrollment option (for testing)
  const handleSkipEnrollment = () => {
    if (!isRequired) {
      toast.info('Face enrollment skipped');
      onSuccess();
    }
  };

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} />
            Enrollment Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-2">
            <Button onClick={initializeSystem} className="flex-1">
              Retry
            </Button>
            {!isRequired && (
              <Button variant="outline" onClick={handleSkipEnrollment} className="flex-1">
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
          Face Enrollment
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
                  <p className="text-sm">Loading face enrollment...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Success Overlay */}
          <AnimatePresence>
            {isEnrolled && (
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
                  <p className="text-lg font-semibold">Face Enrolled Successfully!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Failure Overlay */}
          <AnimatePresence>
            {enrollmentFailed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-red-500/80 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <X className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Enrollment Failed</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Status Information */}
        {!isInitializing && !isEnrolled && !enrollmentFailed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Face Quality:</span>
              <span className={confidence >= 0.7 ? 'text-green-600' : confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600'}>
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
            <div className="flex items-center justify-between text-sm">
              <span>Status:</span>
              <span className={faceDetected ? 'text-green-600' : 'text-red-600'}>
                {faceDetected ? 'Face Detected' : 'No Face'}
              </span>
            </div>
          </div>
        )}
        
        {/* Enrollment Button */}
        {!isInitializing && !isEnrolled && !enrollmentFailed && (
          <Button 
            onClick={handleEnrollment}
            disabled={!faceDetected || confidence < 0.5 || isEnrolling}
            className="w-full"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enrolling Face...
              </>
            ) : (
              'Enroll My Face'
            )}
          </Button>
        )}
        
        {/* Instructions */}
        {!isInitializing && !isEnrolled && !enrollmentFailed && (
          <p className="text-xs text-muted-foreground text-center">
            Position your face in the frame and move slightly to confirm liveness.
            Click "Enroll My Face" when the quality is good (green).
          </p>
        )}
        
        {/* Skip Button (for testing) */}
        {!isRequired && !isEnrolled && !enrollmentFailed && (
          <Button 
            variant="outline" 
            onClick={handleSkipEnrollment}
            className="w-full"
          >
            Skip Enrollment (Testing)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FaceEnrollmentPage;
