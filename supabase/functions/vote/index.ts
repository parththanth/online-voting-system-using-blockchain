import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts"
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'secret'

// JWT verification using djwt library (consistent with auth functions)
async function verifyJWT(token: string) {
  try {
    console.log('Vote - Verifying JWT token using djwt, length:', token.length);
    
    // Create verification key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    
    console.log('Vote - Verification key created');
    
    // Use djwt verify function 
    const payload = await verify(token, key);
    console.log('Vote - JWT payload verified successfully:', { 
      sub: payload.sub, 
      exp: payload.exp,
      otp_verified: payload.otp_verified,
      face_verified: payload.face_verified 
    });
    
    return payload;
  } catch (error) {
    console.error('Vote - JWT verification error:', error);
    return null;
  }
}

// Simulate blockchain transaction
async function createBlockchainTransaction(userId: string, partyId: string, voteHash: string) {
  try {
    // In production, this would interact with actual Ethereum network
    // using the ETHEREUM_PRIVATE_KEY and ETHEREUM_RPC_URL
    
    // Simulate transaction hash
    const txHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log(`Blockchain transaction created: ${txHash} for user: ${userId}, party: ${partyId}`)
    
    return { txHash, confirmed: true }
  } catch (error) {
    console.error('Blockchain transaction failed:', error)
    throw error
  }
}

serve(async (req) => {
  console.log('Vote - Request method:', req.method);
  console.log('Vote - Request URL:', req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    console.log('Vote - Auth header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Vote - No Bearer token found');
      return new Response(
        JSON.stringify({ 
          error: 'Authorization token required',
          details: 'Missing or invalid Authorization header'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7)
    console.log('Vote - Extracted token length:', token.length);
    
    const payload = await verifyJWT(token)
    
    if (!payload) {
      console.log('Vote - JWT verification failed - returning 401');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired token',
          details: 'JWT verification failed'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Vote - Token verification successful for user:', payload.sub);
    
    // Check verification requirements
    if (!payload.otp_verified) {
      console.log('Vote - User OTP verification incomplete');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication incomplete',
          details: 'OTP verification required'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    console.log('Vote - Request body received:', requestBody);
    
    const { partyId, partyName } = requestBody
    
    if (!partyId || !partyName) {
      console.log('Vote - Missing party data');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request',
          details: 'Party ID and name are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user details
    console.log('Vote - Getting user details for:', payload.sub);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single()

    if (userError || !user) {
      console.error('Vote - User lookup error:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          details: userError?.message || 'User lookup failed'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has already voted
    if (user.has_voted) {
      console.log('Vote - User already voted');
      await supabase
        .from('security_alerts')
        .insert({
          type: 'duplicate_vote',
          user_id: user.id,
          user_phone: user.phone_number,
          details: { attempted_party: partyId }
        })

      return new Response(
        JSON.stringify({ 
          error: 'already_voted',
          message: 'You have already cast your vote'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create vote hash for privacy
    console.log('Vote - Creating vote hash');
    const voteData = `${user.id}-${partyId}-${Date.now()}`
    const voteHashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(voteData)
    )
    const voteHash = Array.from(new Uint8Array(voteHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Create blockchain transaction
    console.log('Vote - Creating blockchain transaction');
    const blockchainResult = await createBlockchainTransaction(user.id, partyId, voteHash)

    // Store vote in database with admin test flag
    console.log('Vote - Storing vote in database');
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        party_id: partyId,
        party_name: partyName,
        vote_hash: voteHash,
        tx_hash: blockchainResult.txHash,
        blockchain_confirmed: blockchainResult.confirmed
      })
      .select()
      .single()

    if (voteError) {
      console.error('Vote storage error:', voteError)
      return new Response(
        JSON.stringify({ 
          error: 'Vote recording failed',
          details: voteError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark user as voted to enforce one person, one vote
    console.log('Vote - Marking user as voted');
    const { error: updateError } = await supabase
      .from('users')
      .update({ has_voted: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('Vote - User update error:', updateError);
    }

    console.log(`Vote recorded successfully: User ${user.id} voted for ${partyName} (${partyId})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vote recorded successfully',
        transactionId: blockchainResult.txHash,
        voteId: vote.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Vote - Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message || 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
