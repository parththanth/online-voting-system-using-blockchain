
import { useState, useEffect, useRef } from "react";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraActive: boolean;
  cameraLoading: boolean;
  cameraError: string | null;
  facingMode: "user" | "environment";
  enableCamera: () => Promise<void>;
  stopCamera: () => void;
  toggleCameraFacing: () => Promise<void>;
}

export function useCamera({ facingMode = "user" }: UseCameraOptions = {}): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<"user" | "environment">(facingMode);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const enableCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    
    try {
      // Stop any existing streams
      stopCamera();
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setCameraActive(true);
        setStream(newStream);
      }
    } catch (error: unknown) {
      console.error("Error accessing camera:", error);
      setCameraError("Failed to access camera. Please check your permissions and try again.");
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };
  
  const toggleCameraFacing = async () => {
    const newFacingMode = currentFacingMode === "user" ? "environment" : "user";
    setCurrentFacingMode(newFacingMode);
    
    if (cameraActive) {
      setCameraLoading(true);
      
      try {
        // Stop current stream
        stopCamera();
        
        // Start new stream with toggled facing mode
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          setCameraActive(true);
          setStream(newStream);
        }
      } catch (error: unknown) {
        console.error("Error toggling camera:", error);
        setCameraError("Failed to switch camera. Your device may not support multiple cameras.");
        
        // Try to revert back to the previous camera if toggling fails
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: currentFacingMode },
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            setCameraActive(true);
            setStream(fallbackStream);
            setCurrentFacingMode(currentFacingMode); // Reset to previous mode
          }
        } catch (e) {
          setCameraActive(false);
        }
      } finally {
        setCameraLoading(false);
      }
    }
  };

  useEffect(() => {
    enableCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    cameraActive,
    cameraLoading,
    cameraError,
    facingMode: currentFacingMode,
    enableCamera,
    stopCamera,
    toggleCameraFacing,
  };
}
