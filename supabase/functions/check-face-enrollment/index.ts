import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('JWT_SECRET') || 'secret')

async function verifyJWT(token: string) {
  try {
    const payload = await verify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)
    
    if (!payload || !payload.sub) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { userId } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has face enrollment data
    const { data: enrollments, error: queryError } = await supabase
      .from('face_enrollment')
      .select('id, created_at, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)

    if (queryError) {
      console.error('Database query error:', queryError)
      return new Response(
        JSON.stringify({ error: 'Failed to check enrollment status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const hasEnrollment = enrollments && enrollments.length > 0

    console.log(`Face enrollment check for user ${userId}: ${hasEnrollment ? 'Found' : 'Not found'}`)

    // Log the check for audit purposes
    await supabase
      .from('security_alerts')
      .insert({
        user_id: userId,
        alert_type: 'face_enrollment_check',
        description: `Face enrollment status checked: ${hasEnrollment ? 'enrolled' : 'not_enrolled'}`,
        severity: 'info',
        metadata: {
          user_id: userId,
          has_enrollment: hasEnrollment,
          enrollment_count: enrollments?.length || 0,
          timestamp: new Date().toISOString()
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        hasEnrollment,
        enrollmentCount: enrollments?.length || 0,
        message: hasEnrollment 
          ? 'User has face enrollment data' 
          : 'User needs to enroll face data'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Check face enrollment error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
