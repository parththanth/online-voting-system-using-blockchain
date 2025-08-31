
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'secret'

async function verifyJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const providedSignature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    const signatureInput = `${headerB64}.${payloadB64}`;
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      providedSignature,
      new TextEncoder().encode(signatureInput)
    );
    
    if (!isValid) {
      return null;
    }
    
    const payload = JSON.parse(atob(payloadB64));
    
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
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
    
    if (!payload || payload.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const type = url.searchParams.get('type')

    let query = supabase
      .from('security_alerts')
      .select(`
        id,
        type,
        user_email,
        ip_address,
        timestamp,
        resolved,
        details
      `)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('type', type)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch logs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Transform logs to match frontend expectations
    const transformedLogs = logs?.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      type: log.type.replace('_', '-'),
      status: getSeverityFromType(log.type),
      voter: log.user_email ? log.user_email.split('@')[0] : 'Unknown',
      voterID: log.user_email || 'Unknown',
      location: log.ip_address || 'Unknown',
      description: getDescriptionFromLog(log),
      severity: getSeverityFromType(log.type)
    })) || []

    return new Response(
      JSON.stringify({ 
        success: true, 
        logs: transformedLogs,
        total: logs?.length || 0
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

function getSeverityFromType(type: string): string {
  switch (type) {
    case 'duplicate_vote':
      return 'critical'
    case 'face_verify_failure':
      return 'high'
    case 'otp_failure':
      return 'medium'
    case 'suspicious_ip':
      return 'high'
    default:
      return 'low'
  }
}

function getDescriptionFromLog(log: any): string {
  switch (log.type) {
    case 'otp_failure':
      return `OTP verification failed: ${log.details?.reason || 'Invalid OTP'}`
    case 'face_verify_failure':
      return `Face verification failed: ${log.details?.reason || 'Verification failed'}`
    case 'duplicate_vote':
      return `Duplicate vote attempt detected for party: ${log.details?.attempted_party || 'Unknown'}`
    case 'suspicious_ip':
      return `Suspicious IP activity detected from ${log.ip_address}`
    default:
      return 'Security event logged'
  }
}
