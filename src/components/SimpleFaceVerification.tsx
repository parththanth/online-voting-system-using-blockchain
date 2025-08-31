import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle, XCircle, RefreshCw, Shield, Eye } from 'lucide-react';
import * as faceRecognitionService from '@/services/faceRecognitionService';
import { toast } from 'sonner';

interface SimpleFaceVerificationProps {
  onSuccess: (confidence: number) => void;
  onFailure: (error: string) => void;
}

const SimpleFaceVerification: React.FC<SimpleFaceVerificationProps> = ({
  onSuccess,
  onFailure
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [livenessScore, setLivenessScore] = useState(0);

  useEffect(() => {
    initializeSystem();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Real-time face detection
  useEffect(() => {
    let animationFrame: number;
    
    const detectFaceInRealTime = async () => {
      if (videoRef.current && cameraReady && !isVerifying) {
        try {
          const video = videoRef.current;
          const detection = await faceRecognitionService.detectFaceInVideo(video);
          
          if (detection) {
            setFaceDetected(true);
            setConfidence(detection.confidence);
            
            // Draw detection overlay
            drawFaceOverlay(detection);
          } else {
            setFaceDetected(false);
            setConfidence(0);
            clearCanvas();
          }
        } catch (error) {
          // Silently handle detection errors
        }
      }
      
      animationFrame = requestAnimationFrame(detectFaceInRealTime);
    };

    if (cameraReady && !isVerifying) {
      detectFaceInRealTime();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [cameraReady, isVerifying]);

  type DetectionBox = { x: number; y: number; width: number; height: number };
  type FaceDetection = { box: DetectionBox; confidence: number };

  const drawFaceOverlay = (detection: FaceDetection) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bounding box
    const { x, y, width, height } = detection.box;
    ctx.strokeStyle = faceDetected && confidence > 0.7 ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
    
    // Draw confidence
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = '16px Arial';
    ctx.fillText(`${Math.round(confidence * 100)}%`, x, y - 10);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const initializeSystem = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize face recognition
      const initialized = await faceRecognitionService.initializeFaceAPI();
      if (!initialized) {
        throw new Error('Failed to initialize face recognition');
      }

      // Start camera
      await startCamera();
      setCameraReady(true);
      toast.success('Camera ready for verification');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            videoRef.current?.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          
          if (videoRef.current!.readyState >= 1) {
            resolve();
          } else {
            videoRef.current!.addEventListener('loadedmetadata', onLoaded);
          }
        });
      }
    } catch (err) {
      throw new Error('Camera access denied. Please allow camera permissions.');
    }
  };

  const handleVerifyFace = async () => {
    if (!videoRef.current || !cameraReady) {
      toast.error('Camera not ready');
      return;
    }

    if (!faceDetected) {
      toast.error('Please position your face in the camera view');
      return;
    }

    setIsVerifying(true);
    setProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 85));
      }, 100);

      // Get user ID from storage
      const storedUserId = localStorage.getItem('userId') || '';
      const userPhone = localStorage.getItem('userPhone') || '';
      const userEmail = localStorage.getItem('userEmail') || '';
      const userId = storedUserId || userPhone || userEmail;

      if (!userId) {
        throw new Error('No user identifier found. Please log in again.');
      }

      // Perform face recognition
      const result = await faceRecognitionService.recognizeFaceForUser(videoRef.current, userId);

      clearInterval(progressInterval);
      setProgress(100);

      // Enhanced validation with multiple checks
      const isSuccessful = result.isAuthorized && result.confidence >= 0.65;

      if (isSuccessful) {
        toast.success(`Face verified! Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        onSuccess(result.confidence);
      } else {
        const errorMsg = `Face verification failed. Confidence: ${(result.confidence * 100).toFixed(1)}%`;
        toast.error(errorMsg);
        onFailure(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMsg);
      toast.error(errorMsg);
      onFailure(errorMsg);
    } finally {
      setIsVerifying(false);
      setProgress(0);
    }
  };

  const handleRetry = () => {
    setError(null);
    setFaceDetected(false);
    setConfidence(0);
    initializeSystem();
  };

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Initializing camera and face recognition...</span>
        </div>
        <Progress value={50} className="w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center border-red-200 bg-red-50">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-4">
          <Shield className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Face Verification</h3>
          <p className="text-muted-foreground">
            Position your face in the camera view for verification
          </p>
        </div>

        <div className="relative mb-4 mx-auto max-w-md">
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg border-2 border-dashed border-primary/30"
            style={{ maxHeight: '360px' }}
          />
          
          {/* Canvas overlay for face detection */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ maxHeight: '360px' }}
          />
          
          {/* Status indicators */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              faceDetected 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              <Eye className="w-3 h-3" />
              {faceDetected ? 'Face Detected' : 'No Face'}
            </div>
            
            {faceDetected && (
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
                <Shield className="w-3 h-3" />
                {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        </div>

        {isVerifying && (
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Verifying face...</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleVerifyFace}
            disabled={!cameraReady || isVerifying || !faceDetected}
            className="flex items-center gap-2"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {isVerifying ? 'Verifying...' : 'Verify Face'}
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">🔒 Face Verification Tips:</p>
          <ul className="text-xs space-y-1">
            <li>• Look directly at the camera</li>
            <li>• Ensure good lighting on your face</li>
            <li>• Keep your face centered and still</li>
            <li>• Remove glasses or face coverings if possible</li>
            <li>• Wait for "Face Detected" indicator before verifying</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SimpleFaceVerification;