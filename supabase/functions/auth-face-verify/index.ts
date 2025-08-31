
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('JWT_SECRET') || 'secret')

async function verifyJWT(token: string) {
  try {
    const payload = await verify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

// Encryption utilities for face descriptors
const textEncoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function tryDecodeHex(hex: string): Uint8Array | null {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (cleaned.length % 2 !== 0) return null;
  try {
    const arr = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < arr.length; i++) arr[i] = parseInt(cleaned.substr(i * 2, 2), 16);
    return arr;
  } catch {
    return null;
  }
}

async function getAesKey(): Promise<CryptoKey> {
  const secret = Deno.env.get('FACE_EMBEDDING_KEY') || '';
  let keyBytes: Uint8Array | null = null;
  try {
    keyBytes = base64ToBytes(secret);
  } catch {
    keyBytes = tryDecodeHex(secret);
  }
  if (!keyBytes) keyBytes = textEncoder.encode(secret);
  if (keyBytes.length < 32) {
    const padded = new Uint8Array(32);
    padded.set(keyBytes);
    keyBytes = padded;
  } else if (keyBytes.length > 32) {
    keyBytes = keyBytes.slice(0, 32);
  }
  return await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function decryptDescriptor(record: any): Promise<number[] | null> {
  try {
    const key = await getAesKey();
    const iv = base64ToBytes(record.iv);
    const data = base64ToBytes(record.data);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    const json = new TextDecoder().decode(new Uint8Array(plainBuf));
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) return arr as number[];
    return null;
  } catch (e) {
    console.error('Decryption failed:', e);
    return null;
  }
}

// Calculate euclidean distance between two face descriptors
function calculateDistance(desc1: number[], desc2: number[]): number {
  if (desc1.length !== desc2.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Real face verification using stored descriptors
async function verifyFaceDescriptor(userId: string, inputDescriptor: number[]): Promise<{ success: boolean; confidence: number; liveness: boolean }> {
  try {
    // Get all active face enrollments for user
    const { data: enrollments, error } = await supabase
      .from("face_enrollment")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error || !enrollments || enrollments.length === 0) {
      console.error('No face enrollments found for user:', userId);
      return { success: false, confidence: 0, liveness: false };
    }

    let bestMatch = 1.0; // Start with maximum distance
    let matchFound = false;

    // Compare against all enrolled descriptors
    for (const enrollment of enrollments) {
      const storedDescriptor = await decryptDescriptor(enrollment.face_descriptor);
      if (!storedDescriptor) continue;

      const distance = calculateDistance(inputDescriptor, storedDescriptor);
      const threshold = enrollment.confidence_threshold || 0.6;
      
      console.log(`Face comparison - Distance: ${distance}, Threshold: ${threshold}`);
      
      if (distance < threshold && distance < bestMatch) {
        bestMatch = distance;
        matchFound = true;
      }
    }

    // Convert distance to confidence score (lower distance = higher confidence)
    const confidence = matchFound ? Math.max(0, 1 - bestMatch) : 0;
    const liveness = confidence > 0.5; // Basic liveness check based on confidence
    const success = matchFound && confidence > 0.6;

    console.log(`Face verification result - Success: ${success}, Confidence: ${confidence}, Distance: ${bestMatch}`);
    
    return { success, confidence, liveness };
  } catch (error) {
    console.error('Face verification error:', error);
    return { success: false, confidence: 0, liveness: false };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)
    
    if (!payload || !payload.otp_verified) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or OTP not verified' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { imageData, faceDescriptor } = await req.json()
    
    if (!imageData && !faceDescriptor) {
      return new Response(
        JSON.stringify({ error: 'Image data or face descriptor is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Perform real face verification using descriptors
    let verification;
    if (faceDescriptor && Array.isArray(faceDescriptor)) {
      // Use provided face descriptor for verification
      verification = await verifyFaceDescriptor(payload.sub, faceDescriptor);
    } else {
      // Fallback: basic image validation if only image data provided
      if (!imageData || !imageData.startsWith('data:image/')) {
        verification = { success: false, confidence: 0, liveness: false };
      } else {
        // For image-only requests, return error asking for face descriptor
        return new Response(
          JSON.stringify({ error: 'Face descriptor extraction required on client side' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Log verification attempt
    await supabase
      .from('face_verification_attempts')
      .insert({
        user_id: payload.sub,
        success: verification.success,
        confidence_score: verification.confidence,
        liveness_check_passed: verification.liveness,
        ip_address: clientIP
      });

    // Audit log
    try {
      await supabase.from('audit_logs').insert({
        user_id: payload.sub,
        event_type: 'auth_attempt',
        details: { success: verification.success, confidence: verification.confidence, liveness: verification.liveness, ip: clientIP }
      });
    } catch (e) {
      console.error('audit_logs insert failed (auth attempt):', e);
    }

    if (!verification.success) {
      await supabase
        .from('security_alerts')
        .insert({
          type: 'face_verify_failure',
          user_id: payload.sub,
          user_email: payload.email,
          ip_address: clientIP,
          details: {
            confidence: verification.confidence,
            liveness_passed: verification.liveness,
            reason: !verification.liveness ? 'liveness_failed' : 'low_confidence'
          }
        })

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Face verification failed',
          details: {
            confidence: verification.confidence,
            liveness_passed: verification.liveness
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store face embedding (in production, this would be actual face embedding data)
    const faceEmbedding = {
      timestamp: new Date().toISOString(),
      confidence: verification.confidence,
      verified: true
    }

    // Update user as face verified
    await supabase
      .from('users')
      .update({
        face_verified: true,
        face_embedding: faceEmbedding
      })
      .eq('id', payload.sub)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Face verification successful',
        confidence: verification.confidence
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
