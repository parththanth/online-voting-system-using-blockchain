
import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { 
  initializeFaceAPI, 
  loadAuthorizedFaceDescriptors, 
  recognizeFace 
} from '@/services/faceRecognitionService';

interface UseFacialRecognitionOptions {
  onSuccess?: () => void;
  onFailure?: () => void;
  autoStart?: boolean;
}

interface UseFacialRecognitionReturn {
  isInitialized: boolean;
  isVerifying: boolean;
  isVerified: boolean;
  error: string | null;
  confidence: number;
  faceLabel: string;
  startVerification: () => void;
  stopVerification: () => void;
  resetVerification: () => void;
}

export function useFacialRecognition({
  onSuccess,
  onFailure,
  autoStart = false
}: UseFacialRecognitionOptions = {}): UseFacialRecognitionReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [faceLabel, setFaceLabel] = useState('');
  
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize face recognition system
  const initialize = async () => {
    try {
      setError(null);
      
      // Load face-api models
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
      faceMatcherRef.current = new faceapi.FaceMatcher([authorizedDescriptors], 0.4);
      setIsInitialized(true);
      
      if (autoStart) {
        startVerification();
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Initialization failed';
      setError(errorMessage);
      console.error('Face recognition initialization error:', err);
    }
  };

  // Start face verification process
  const startVerification = () => {
    if (!isInitialized || !faceMatcherRef.current) {
      setError('System not initialized');
      return;
    }
    
    setIsVerifying(true);
    setError(null);
  };

  // Stop face verification
  const stopVerification = () => {
    setIsVerifying(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Reset verification state
  const resetVerification = () => {
    stopVerification();
    setIsVerified(false);
    setConfidence(0);
    setFaceLabel('');
    setError(null);
  };

  // Perform face recognition on video element
  const performRecognition = async (videoElement: HTMLVideoElement) => {
    if (!faceMatcherRef.current) return;
    
    try {
      const result = await recognizeFace(videoElement, faceMatcherRef.current);
      
      setConfidence(result.confidence);
      setFaceLabel(result.label);
      
      // Check if verification is successful
      if (result.isAuthorized && result.confidence >= 0.6) {
        setIsVerified(true);
        setIsVerifying(false);
        onSuccess?.();
      } else if (result.confidence > 0 && !result.isAuthorized) {
        // Face detected but not authorized
        onFailure?.();
      }
      
    } catch (err) {
      console.error('Face recognition error:', err);
      setError('Recognition failed');
    }
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
    
    // Cleanup on unmount
    return () => {
      stopVerification();
    };
  }, []);

  return {
    isInitialized,
    isVerifying,
    isVerified,
    error,
    confidence,
    faceLabel,
    startVerification,
    stopVerification,
    resetVerification
  };
}
