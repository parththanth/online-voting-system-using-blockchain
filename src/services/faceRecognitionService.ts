
import * as faceapi from 'face-api.js';

// Face recognition configuration
const MODEL_URL = '/models';
const FACE_MATCH_THRESHOLD = 0.6;

// Face detection options
const getFaceDetectorOptions = () => {
  return new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
};

// Initialize face-api models
export const initializeFaceAPI = async (): Promise<boolean> => {
  try {
    console.log('Loading face-api.js models...');
    
    // Load required models from local files
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    console.log('Face-api.js models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    return false;
  }
};

// This function is deprecated - face descriptors are now loaded from database
export const loadAuthorizedFaceDescriptors = async (): Promise<faceapi.LabeledFaceDescriptors | null> => {
  console.log('loadAuthorizedFaceDescriptors is deprecated - using database enrollment data instead');
  return null;
};

// Perform face recognition on video element with user-specific descriptors
export const recognizeFaceForUser = async (
  videoElement: HTMLVideoElement,
  userId: string
): Promise<{
  isAuthorized: boolean;
  confidence: number;
  label: string;
  detection?: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>;
}> => {
  try {
    console.log('Attempting face detection for user:', userId);
    
    // Load user's face descriptors
    const userDescriptors = await loadUserFaceDescriptors(userId);
    if (!userDescriptors) {
      return {
        isAuthorized: false,
        confidence: 0,
        label: 'No enrolled face data found',
      };
    }
    
    // Create face matcher with user's descriptors
    const faceMatcher = new faceapi.FaceMatcher([userDescriptors], 0.5);
    
    // Use TinyFaceDetector since we only have those models
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      console.log('No face detected in current video frame');
      return {
        isAuthorized: false,
        confidence: 0,
        label: 'No face detected',
      };
    }
    
    // Match against user's enrolled face
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    const distance = bestMatch.distance;
    const confidence = Math.max(0, 1 - distance);
    
    // Progressive threshold for user verification - more lenient initially
    const isAuthorized = bestMatch.label !== 'unknown' && 
                        distance <= 0.5 && // More forgiving distance threshold
                        confidence >= 0.4;  // Lower initial confidence requirement
    
    console.log('Face recognition result:', {
      userId: userId,
      label: bestMatch.label,
      distance: bestMatch.distance,
      confidence: confidence,
      isAuthorized: isAuthorized
    });
    
    return {
      isAuthorized,
      confidence: confidence,
      label: isAuthorized ? userId : 'Unauthorized',
      detection
    };
  } catch (error) {
    console.error('Error in face recognition for user:', error);
    return {
      isAuthorized: false,
      confidence: 0,
      label: 'Recognition error',
    };
  }
};

// Legacy function - perform face recognition on video element
export const recognizeFace = async (
  videoElement: HTMLVideoElement,
  faceMatcher: faceapi.FaceMatcher
): Promise<{
  isAuthorized: boolean;
  confidence: number;
  label: string;
  detection?: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>;
}> => {
  try {
    console.log('Attempting face detection in video stream...');
    
    // Use TinyFaceDetector since we only have those models
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      console.log('No face detected in current video frame');
      return {
        isAuthorized: false,
        confidence: 0,
        label: 'No face detected',
      };
    }
    
    // Match against authorized face with strict threshold
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    const distance = bestMatch.distance;
    const confidence = Math.max(0, 1 - distance);
    
    // Strict security: only authorize if it's a known face with high confidence
    const isAuthorized = bestMatch.label !== 'unknown' && 
                        distance <= 0.35 && // Stricter distance threshold 
                        confidence >= 0.65;  // Require high confidence
    
    console.log('Face recognition result:', {
      label: bestMatch.label,
      distance: bestMatch.distance,
      confidence: confidence,
      isAuthorized: isAuthorized
    });
    
    return {
      isAuthorized,
      confidence: confidence,
      label: isAuthorized ? bestMatch.label : 'Unauthorized',
      detection
    };
  } catch (error) {
    console.error('Error in face recognition:', error);
    return {
      isAuthorized: false,
      confidence: 0,
      label: 'Recognition error',
    };
  }
};

/**
 * Create face descriptor from image element
 */
export const createFaceDescriptor = async (imageElement: HTMLImageElement): Promise<number[] | null> => {
  try {
    // Use TinyFaceDetector since we only have those models
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    return detection ? Array.from(detection.descriptor) : null;
  } catch (error) {
    console.error('Error creating face descriptor:', error);
    return null;
  }
};

/**
 * Load user-specific face descriptors from database
 */
export const loadUserFaceDescriptors = async (userId: string): Promise<faceapi.LabeledFaceDescriptors | null> => {
  try {
    // Prefer secure retrieval via Edge Function (handles decryption)
    const SUPABASE_URL = 'https://zjymowjrqidmgslauauv.supabase.co';
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/face-enrollment?userId=${encodeURIComponent(userId)}`);
    let descriptors: Float32Array[] = [];

    if (resp.ok) {
      const json = await resp.json();
      const enrollments = Array.isArray(json?.enrollments) ? (json.enrollments as Array<{ face_descriptor?: number[] }>) : [];
      descriptors = enrollments
        .map((row) => (Array.isArray(row.face_descriptor) ? row.face_descriptor : null))
        .filter((d): d is number[] => Array.isArray(d))
        .map((d) => new Float32Array(d));
    }

    // Fallback: direct DB query (legacy, expects plaintext descriptors)
    if (descriptors.length === 0) {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('face_enrollment')
        .select('face_descriptor')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('enrollment_date', { ascending: false });

      if (!error && Array.isArray(data)) {
        descriptors = (data as Array<{ face_descriptor?: number[] }>)
          .map((row) => (Array.isArray(row.face_descriptor) ? row.face_descriptor : null))
          .filter((d): d is number[] => Array.isArray(d))
          .map((d) => new Float32Array(d));
      }
    }

    // Fallback to localStorage for backward compatibility
    if (descriptors.length === 0) {
      const storedDescriptor = localStorage.getItem(`faceDescriptor_${userId}`);
      if (storedDescriptor) {
        const d = JSON.parse(storedDescriptor);
        if (Array.isArray(d)) descriptors.push(new Float32Array(d));
      }
    }

    if (descriptors.length === 0) return null;

    return new faceapi.LabeledFaceDescriptors(userId, descriptors);
  } catch (error) {
    console.error('Error loading user face descriptors:', error);
    return null;
  }
};

// Simple liveness detection (basic movement detection)
export const detectLiveness = (
  previousFrame: ImageData | null,
  currentFrame: ImageData
): boolean => {
  if (!previousFrame) return true;
  
  // Simple pixel difference detection
  let diffCount = 0;
  const threshold = 30;
  const sampleRate = 10; // Check every 10th pixel for performance
  
  for (let i = 0; i < currentFrame.data.length; i += 4 * sampleRate) {
    const rDiff = Math.abs(currentFrame.data[i] - previousFrame.data[i]);
    const gDiff = Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]);
    const bDiff = Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);
    
    if (rDiff + gDiff + bDiff > threshold) {
      diffCount++;
    }
  }
  
  // If more than 1% of sampled pixels changed significantly, consider it live
  const changePercentage = (diffCount * sampleRate) / (currentFrame.data.length / 4) * 100;
  return changePercentage > 1;
};

/**
 * Face detection for video stream
 */
export const detectFaceInVideo = async (videoElement: HTMLVideoElement): Promise<{
  box: { x: number; y: number; width: number; height: number };
  confidence: number;
} | null> => {
  try {
    const detections = await faceapi
      .detectAllFaces(videoElement, getFaceDetectorOptions())
      .withFaceLandmarks();
    
    if (!detections || detections.length === 0) {
      return null;
    }
    
    // Return the first detection with highest confidence
    const detection = detections[0];
    return {
      box: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height
      },
      confidence: detection.detection.score
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
};
