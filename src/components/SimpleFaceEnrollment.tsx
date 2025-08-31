import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import * as faceRecognitionService from '@/services/faceRecognitionService';


interface SimpleFaceEnrollmentProps {
  userId: string;
  onSuccess: (faceDescriptors: number[][]) => void;
  onSkip: () => void;
}

const SimpleFaceEnrollment: React.FC<SimpleFaceEnrollmentProps> = ({
  userId,
  onSuccess,
  onSkip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Effect for initializing the system and cleaning up the stream
  useEffect(() => {
    initializeSystem();

    // Cleanup function to stop camera tracks when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // The empty dependency array [] ensures this effect runs only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This new effect is dedicated to attaching the stream to the video element.
  // It runs whenever the `stream` state variable changes.
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);

      // Attach and ensure the video is actually playing with valid dimensions
      if (videoRef.current) {
        const v = videoRef.current;
        v.srcObject = mediaStream;

        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            v.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          if (v.readyState >= 1) resolve();
          else v.addEventListener('loadedmetadata', onLoaded);
        });

        try { await v.play(); } catch (e) { console.debug('video.play failed', e); }

        // Wait briefly for dimensions to populate
        let tries = 0;
        while ((v.videoWidth === 0 || v.videoHeight === 0) && tries < 20) {
          await new Promise(r => setTimeout(r, 100));
          tries++;
        }

        if (v.videoWidth > 0 && v.videoHeight > 0) {
          setCameraReady(true);
          toast.success('Camera ready for face enrollment');
        } else {
          throw new Error('Camera stream not ready. Please try again.');
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

    setIsEnrolling(true);
    setProgress(0);

    try {
      const video = videoRef.current;

      // Guard against long-running model calls that can appear stuck
      const withTimeout = async <T,>(promise: Promise<T>, ms: number, onTimeout?: () => void): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
          const timer = setTimeout(() => {
            try {
              if (onTimeout) {
                onTimeout();
              }
            } catch (e) { console.debug('onTimeout handler failed', e); }
            reject(new Error('Operation timed out'));
          }, ms);
          promise.then((v) => { clearTimeout(timer); resolve(v); })
                 .catch((e) => { clearTimeout(timer); reject(e); });
        });
      };

      const captureImage = async (): Promise<HTMLImageElement> => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.src = canvas.toDataURL('image/jpeg', 0.92);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load captured image'));
        });
        return img;
      };

      const totalSamples = 5;
      const descriptors: number[][] = [];

      for (let i = 0; i < totalSamples; i++) {
        const img = await captureImage();
        let desc: number[] | null = null;
        try {
          // Timebox descriptor creation to avoid hangs on slow networks/devices
          desc = await withTimeout(
            faceRecognitionService.createFaceDescriptor(img),
            5000,
            () => console.warn('Descriptor creation timeout for sample', i + 1)
          );
        } catch (e) {
          console.warn('Descriptor creation failed for sample', i + 1, e);
        }
        if (desc) descriptors.push(desc);
        setProgress(Math.min(95, Math.round(((i + 1) / totalSamples) * 95)));
        await new Promise((r) => setTimeout(r, 250));
      }

      // If we captured at least one descriptor, proceed; otherwise surface a clear error
      if (descriptors.length === 0) {
        throw new Error('Enrollment timed out. Please adjust lighting/position and try again.');
      }

      // Cache an averaged descriptor for backward compatibility flows
      try {
        const length = descriptors[0].length;
        const avg = new Array(length).fill(0);
        descriptors.forEach((d) => {
          for (let i = 0; i < length; i++) avg[i] += d[i];
        });
        for (let i = 0; i < length; i++) avg[i] /= descriptors.length;
        localStorage.setItem(`faceDescriptor_${userId}`, JSON.stringify(avg));
      } catch (e) { console.debug('Failed to cache averaged descriptor', e); }

      setProgress(100);
      toast.success('Captured multiple samples successfully');
      // Show a saving overlay while parent persists descriptors
      onSuccess(descriptors);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Enrollment failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsEnrolling(false);
      setProgress(0);
    }
  };

  const handleRetry = () => {
    setError(null);
    initializeSystem();
  };

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Initializing camera...</span>
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
          <h3 className="text-lg font-semibold">Face Enrollment</h3>
          <p className="text-muted-foreground">
            Position your face in the camera view and click "Enroll Face"
          </p>
        </div>

        <div className="relative mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md mx-auto rounded-lg border-2 border-dashed border-primary/30"
            style={{ maxHeight: '360px' }}
          />
          
          {/* Face detection overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-primary rounded-full opacity-30" />
          </div>
        </div>

        {isEnrolling && (
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Enrolling face...</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleEnrollFace}
            disabled={!cameraReady || isEnrolling}
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
          <p className="font-medium mb-1">👤 Face Enrollment Tips:</p>
          <ul className="text-xs space-y-1">
            <li>• Look directly at the camera</li>
            <li>• Ensure good lighting on your face</li>
            <li>• Keep your face centered in the circle</li>
            <li>• Remove glasses or face coverings if possible</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SimpleFaceEnrollment;
