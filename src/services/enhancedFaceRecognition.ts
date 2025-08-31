/**
 * Enhanced Face Recognition Service
 * Provides improved face detection, enrollment, and verification with quality checks
 */

import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';

// Enhanced configuration
export const FACE_CONFIG = {
  DETECTION_THRESHOLD: 0.7,
  VERIFICATION_THRESHOLD: 0.65,
  MIN_FACE_SIZE: 100,
  MAX_FACE_SIZE: 800,
  REQUIRED_BRIGHTNESS: { min: 50, max: 200 },
  REQUIRED_SHARPNESS: 0.3,
} as const;

export interface FaceQualityMetrics {
  brightness: number;
  sharpness: number;
  size: number;
  angle: number;
  isGoodQuality: boolean;
  issues: string[];
}

export interface EnhancedDetection {
  box: { x: number; y: number; width: number; height: number };
  confidence: number;
  landmarks: faceapi.FaceLandmarks68;
  descriptor: Float32Array;
  quality: FaceQualityMetrics;
}

export interface LivenessResult {
  isLive: boolean;
  confidence: number;
  checks: {
    eyeMovement: boolean;
    headMovement: boolean;
    blinkDetected: boolean;
    depthVariation: boolean;
  };
}

/**
 * Analyze face quality metrics
 */
export const analyzeFaceQuality = async (
  videoElement: HTMLVideoElement,
  detection: faceapi.FaceDetection,
  landmarks: faceapi.FaceLandmarks68
): Promise<FaceQualityMetrics> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  const { x, y, width, height } = detection.box;
  canvas.width = width;
  canvas.height = height;
  
  // Extract face region
  ctx.drawImage(videoElement, x, y, width, height, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  
  // Calculate metrics
  const brightness = calculateBrightness(imageData);
  const sharpness = calculateSharpness(imageData);
  const size = Math.min(width, height);
  const angle = calculateFaceAngle(landmarks);
  
  const issues: string[] = [];
  
  // Quality checks
  if (brightness < FACE_CONFIG.REQUIRED_BRIGHTNESS.min) issues.push('Too dark');
  if (brightness > FACE_CONFIG.REQUIRED_BRIGHTNESS.max) issues.push('Too bright');
  if (sharpness < FACE_CONFIG.REQUIRED_SHARPNESS) issues.push('Blurry image');
  if (size < FACE_CONFIG.MIN_FACE_SIZE) issues.push('Face too small');
  if (size > FACE_CONFIG.MAX_FACE_SIZE) issues.push('Face too large');
  if (Math.abs(angle) > 15) issues.push('Head tilted too much');
  
  return {
    brightness,
    sharpness,
    size,
    angle,
    isGoodQuality: issues.length === 0,
    issues
  };
};

/**
 * Calculate image brightness
 */
const calculateBrightness = (imageData: ImageData): number => {
  const { data } = imageData;
  let total = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    total += gray;
  }
  
  return total / (data.length / 4);
};

/**
 * Calculate image sharpness using Laplacian variance
 */
const calculateSharpness = (imageData: ImageData): number => {
  const { data, width, height } = imageData;
  const gray = new Array(width * height);
  
  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    gray[idx] = (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  
  // Apply Laplacian kernel
  let variance = 0;
  const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          sum += gray[idx] * kernel[kernelIdx];
        }
      }
      variance += sum * sum;
    }
  }
  
  return variance / ((width - 2) * (height - 2));
};

/**
 * Calculate face angle from landmarks
 */
const calculateFaceAngle = (landmarks: faceapi.FaceLandmarks68): number => {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  
  const leftCenter = leftEye.reduce((sum, point) => ({
    x: sum.x + point.x,
    y: sum.y + point.y
  }), { x: 0, y: 0 });
  leftCenter.x /= leftEye.length;
  leftCenter.y /= leftEye.length;
  
  const rightCenter = rightEye.reduce((sum, point) => ({
    x: sum.x + point.x,
    y: sum.y + point.y
  }), { x: 0, y: 0 });
  rightCenter.x /= rightEye.length;
  rightCenter.y /= rightEye.length;
  
  const angle = Math.atan2(
    rightCenter.y - leftCenter.y,
    rightCenter.x - leftCenter.x
  ) * 180 / Math.PI;
  
  return angle;
};

/**
 * Enhanced face detection with quality analysis
 */
export const detectFaceWithQuality = async (
  videoElement: HTMLVideoElement
): Promise<EnhancedDetection | null> => {
  try {
    const detections = await faceapi
      .detectAllFaces(videoElement, new faceapi.SsdMobilenetv1Options({ 
        minConfidence: FACE_CONFIG.DETECTION_THRESHOLD 
      }))
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    if (!detections || detections.length === 0) {
      return null;
    }
    
    // Use the face with highest confidence
    const detection = detections[0];
    
    const quality = await analyzeFaceQuality(
      videoElement,
      detection.detection,
      detection.landmarks
    );
    
    return {
      box: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height
      },
      confidence: detection.detection.score,
      landmarks: detection.landmarks,
      descriptor: detection.descriptor,
      quality
    };
  } catch (error) {
    console.error('Enhanced face detection error:', error);
    return null;
  }
};

/**
 * Perform liveness detection
 */
export const performLivenessDetection = async (
  videoElement: HTMLVideoElement,
  previousFrame?: ImageData
): Promise<LivenessResult> => {
  const result: LivenessResult = {
    isLive: false,
    confidence: 0,
    checks: {
      eyeMovement: false,
      headMovement: false,
      blinkDetected: false,
      depthVariation: false
    }
  };
  
  try {
    const detection = await detectFaceWithQuality(videoElement);
    if (!detection) {
      return result;
    }
    
    // Basic liveness checks
    const landmarks = detection.landmarks;
    
    // Check for natural eye positions (basic blink detection)
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    const leftEyeHeight = Math.abs(leftEye[1].y - leftEye[5].y);
    const rightEyeHeight = Math.abs(rightEye[1].y - rightEye[5].y);
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
    
    // Natural eye aspect ratio indicates liveness
    result.checks.blinkDetected = avgEyeHeight > 2;
    
    // Check face angle variation (head movement)
    const faceAngle = Math.abs(detection.quality.angle);
    result.checks.headMovement = faceAngle > 2 && faceAngle < 20;
    
    // Basic depth check using face size variation
    result.checks.depthVariation = detection.quality.size > FACE_CONFIG.MIN_FACE_SIZE * 1.2;
    
    // Motion detection with previous frame
    if (previousFrame) {
      result.checks.eyeMovement = detectMotionBetweenFrames(previousFrame, videoElement);
    }
    
    // Calculate overall liveness confidence
    const passedChecks = Object.values(result.checks).filter(Boolean).length;
    result.confidence = passedChecks / Object.keys(result.checks).length;
    result.isLive = result.confidence >= 0.5 && detection.quality.isGoodQuality;
    
    return result;
  } catch (error) {
    console.error('Liveness detection error:', error);
    return result;
  }
};

/**
 * Detect motion between frames
 */
const detectMotionBetweenFrames = (
  previousFrame: ImageData,
  currentVideo: HTMLVideoElement
): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = currentVideo.videoWidth;
    canvas.height = currentVideo.videoHeight;
    ctx.drawImage(currentVideo, 0, 0);
    
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    if (previousFrame.width !== currentFrame.width || 
        previousFrame.height !== currentFrame.height) {
      return false;
    }
    
    let totalDiff = 0;
    const threshold = 30;
    let pixelDiffs = 0;
    
    for (let i = 0; i < currentFrame.data.length; i += 4) {
      const diff = Math.abs(currentFrame.data[i] - previousFrame.data[i]) +
                   Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]) +
                   Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);
      
      if (diff > threshold) {
        pixelDiffs++;
      }
      totalDiff += diff;
    }
    
    const motionPercentage = (pixelDiffs / (currentFrame.data.length / 4)) * 100;
    return motionPercentage > 0.5 && motionPercentage < 15; // Natural motion range
  } catch (error) {
    return false;
  }
};

/**
 * Multi-sample face enrollment with quality validation
 */
export const enrollFaceWithQuality = async (
  videoElement: HTMLVideoElement,
  sampleCount: number = 5
): Promise<{
  success: boolean;
  descriptors: Float32Array[];
  qualityScores: number[];
  averageDescriptor: Float32Array | null;
  error?: string;
}> => {
  const descriptors: Float32Array[] = [];
  const qualityScores: number[] = [];
  
  try {
    for (let i = 0; i < sampleCount; i++) {
      // Wait between samples
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const detection = await detectFaceWithQuality(videoElement);
      
      if (!detection) {
        continue;
      }
      
      if (detection.quality.isGoodQuality) {
        descriptors.push(detection.descriptor);
        qualityScores.push(detection.confidence * (1 - detection.quality.issues.length / 10));
      }
    }
    
    if (descriptors.length < Math.ceil(sampleCount / 2)) {
      return {
        success: false,
        descriptors: [],
        qualityScores: [],
        averageDescriptor: null,
        error: 'Not enough high-quality face samples captured. Please ensure good lighting and face positioning.'
      };
    }
    
    // Calculate average descriptor
    const avgDescriptor = new Float32Array(descriptors[0].length);
    for (let i = 0; i < avgDescriptor.length; i++) {
      let sum = 0;
      for (const descriptor of descriptors) {
        sum += descriptor[i];
      }
      avgDescriptor[i] = sum / descriptors.length;
    }
    
    return {
      success: true,
      descriptors,
      qualityScores,
      averageDescriptor: avgDescriptor
    };
  } catch (error) {
    return {
      success: false,
      descriptors: [],
      qualityScores: [],
      averageDescriptor: null,
      error: error instanceof Error ? error.message : 'Enrollment failed'
    };
  }
};