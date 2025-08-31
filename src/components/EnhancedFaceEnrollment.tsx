import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle, XCircle, RefreshCw, Eye, Shield } from 'lucide-react';
import { toast } from 'sonner';
import * as faceRecognitionService from '@/services/faceRecognitionService';
import * as enhancedFaceRecognition from '@/services/enhancedFaceRecognition';

interface EnhancedFaceEnrollmentProps {
  userId: string;
  onSuccess: (faceDescriptors: number[][]) => void;
  onSkip: () => void;
}

const EnhancedFaceEnrollment: React.FC<EnhancedFaceEnrollmentProps> = ({
  userId,
  onSuccess,
  onSkip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceQuality, setFaceQuality] = useState<{
    isGoodQuality: boolean;
    issues: string[];
    brightness: number;
    sharpness: number;
  } | null>(null);
  const [captureCount, setCaptureCount] = useState(0);
  const [totalCaptures] = useState(5);

  useEffect(() => {
    initializeSystem();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Real-time face detection and quality analysis
  useEffect(() => {
    let animationFrame: number;
    
    const analyzeRealTime = async () => {
      if (videoRef.current && cameraReady && !isEnrolling) {
        try {
          const detection = await enhancedFaceRecognition.detectFaceWithQuality(videoRef.current);
          
          if (detection) {
            setFaceDetected(true);
            setFaceQuality({
              isGoodQuality: detection.quality.isGoodQuality,
              issues: detection.quality.issues,
              brightness: detection.quality.brightness,
              sharpness: detection.quality.sharpness
            });
            
            drawFaceOverlay(detection);
          } else {
            setFaceDetected(false);
            setFaceQuality(null);
            clearCanvas();
          }
        } catch (error) {
          // Silently handle detection errors
        }
      }
      
      animationFrame = requestAnimationFrame(analyzeRealTime);
    };

    if (cameraReady && !isEnrolling) {
      analyzeRealTime();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [cameraReady, isEnrolling]);

  type DetectionBox = { x: number; y: number; width: number; height: number };
  type Quality = { isGoodQuality: boolean; issues: string[]; brightness: number; sharpness: number };
  type EnhancedDetection = { box: DetectionBox; confidence: number; quality: Quality };

  const drawFaceOverlay = (detection: EnhancedDetection) => {
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
    const color = detection.quality.isGoodQuality ? '#10b981' : '#f59e0b';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
    
    // Draw confidence and quality indicators
    ctx.fillStyle = color;
    ctx.font = '14px Arial';
    ctx.fillText(`${Math.round(detection.confidence * 100)}%`, x, y - 25);
    
    if (detection.quality.issues.length > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.font = '12px Arial';
      ctx.fillText(detection.quality.issues[0], x, y - 10);
    }
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
      toast.success('Camera ready for face enrollment');
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
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          
          if (video.readyState >= 1) {
            resolve();
          } else {
            video.addEventListener('loadedmetadata', onLoaded);
          }
        });

        // Wait for video dimensions
        let tries = 0;
        while ((video.videoWidth === 0 || video.videoHeight === 0) && tries < 20) {
          await new Promise(r => setTimeout(r, 100));
          tries++;
        }
      }
    } catch (err) {
      throw new Error('Camera access denied. Please allow camera permissions.');
    }
  };

  const handleEnrollFace = async () => {
    if (!videoRef.current || !cameraReady) {
      toast.error('Camera not ready');
      return;
    }

    if (!faceDetected) {
      toast.error('Please position your face in the camera view');
      return;
    }

    if (!faceQuality?.isGoodQuality) {
      toast.error(`Please improve: ${faceQuality?.issues.join(', ')}`);
      return;
    }

    setIsEnrolling(true);
    setProgress(0);
    setCaptureCount(0);

    try {
      // Use enhanced enrollment with quality validation
      const enrollmentResult = await enhancedFaceRecognition.enrollFaceWithQuality(
        videoRef.current,
        totalCaptures
      );

      if (!enrollmentResult.success) {
        throw new Error(enrollmentResult.error || 'Enrollment failed');
      }

      // Convert descriptors to regular arrays for compatibility
      const descriptorArrays = enrollmentResult.descriptors.map(desc => Array.from(desc));

      // Cache averaged descriptor for backward compatibility
      if (enrollmentResult.averageDescriptor) {
        const avgArray = Array.from(enrollmentResult.averageDescriptor);
        localStorage.setItem(`faceDescriptor_${userId}`, JSON.stringify(avgArray));
      }

      setProgress(100);
      toast.success(`Successfully enrolled ${enrollmentResult.descriptors.length} face samples!`);
      
      // Brief delay to show completion
      setTimeout(() => {
        onSuccess(descriptorArrays);
      }, 1000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Enrollment failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsEnrolling(false);
      setProgress(0);
      setCaptureCount(0);
    }
  };

  const handleRetry = () => {
    setError(null);
    setFaceDetected(false);
    setFaceQuality(null);
    setCaptureCount(0);
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
        <div className="flex gap-2 justify-center">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onSkip} variant="ghost">
            Skip for Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-4">
          <Camera className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Enhanced Face Enrollment</h3>
          <p className="text-muted-foreground">
            We'll capture multiple high-quality face samples for accurate recognition
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
            
            {faceQuality && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                faceQuality.isGoodQuality
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                <Shield className="w-3 h-3" />
                {faceQuality.isGoodQuality ? 'Good Quality' : 'Poor Quality'}
              </div>
            )}
          </div>
          
          {/* Quality issues overlay */}
          {faceQuality && !faceQuality.isGoodQuality && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-yellow-100 border border-yellow-200 rounded p-2">
                <p className="text-xs text-yellow-800 font-medium">Issues:</p>
                <ul className="text-xs text-yellow-700">
                  {faceQuality.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {isEnrolling && (
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">
                Capturing face samples... ({captureCount}/{totalCaptures})
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleEnrollFace}
            disabled={!cameraReady || isEnrolling || !faceDetected || !faceQuality?.isGoodQuality}
            className="flex items-center gap-2"
          >
            {isEnrolling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isEnrolling ? 'Enrolling...' : 'Enroll Face'}
          </Button>
          
          <Button onClick={onSkip} variant="outline">
            Skip for Now
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">👤 Enhanced Enrollment Tips:</p>
          <ul className="text-xs space-y-1">
            <li>• Look directly at the camera</li>
            <li>• Ensure bright, even lighting</li>
            <li>• Keep your face centered and still</li>
            <li>• Remove glasses for better accuracy</li>
            <li>• Wait for "Good Quality" indicator</li>
            <li>• We'll capture {totalCaptures} samples automatically</li>
          </ul>
        </div>
      </Card>

      {faceQuality && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">📊 Face Quality Metrics:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Brightness: {Math.round(faceQuality.brightness)}</div>
              <div>Sharpness: {faceQuality.sharpness.toFixed(2)}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedFaceEnrollment;