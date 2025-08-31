
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET') || 'secret')

async function verifyJWT(token: string) {
  try {
    const payload = await verify(token, JWT_SECRET)
    return payload
  } catch {
    return null
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

    // Get total registered voters
    const { count: totalVoters } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get total votes cast
    const { count: totalVotes } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })

    // Calculate turnout percentage
    const turnoutPercentage = totalVoters ? ((totalVotes || 0) / totalVoters * 100) : 0

    // Get party-wise vote distribution
    const { data: partyVotes } = await supabase
      .from('votes')
      .select('party_id, party_name')

    const partyStats: any = {}
    partyVotes?.forEach(vote => {
      if (!partyStats[vote.party_id]) {
        partyStats[vote.party_id] = {
          partyId: vote.party_id,
          partyName: vote.party_name,
          votes: 0
        }
      }
      partyStats[vote.party_id].votes++
    })

    const partywiseVotes = Object.values(partyStats).map((party: any) => ({
      ...party,
      percentage: totalVotes ? (party.votes / totalVotes * 100) : 0
    }))

    // Get security incidents
    const { count: totalAlerts } = await supabase
      .from('security_alerts')
      .select('*', { count: 'exact', head: true })

    const { count: resolvedAlerts } = await supabase
      .from('security_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', true)

    // Get pending face verifications
    const { count: pendingFaceVerifications } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('otp_verified', true)
      .eq('face_verified', false)

    // Get failed OTP attempts in last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentFailedOTP } = await supabase
      .from('security_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'otp_failure')
      .gte('timestamp', last24Hours)

    const stats = {
      totalRegisteredVoters: totalVoters || 0,
      totalVotesCast: totalVotes || 0,
      voterTurnoutPercentage: Math.round(turnoutPercentage * 100) / 100,
      activePollingStations: 1, // Simulated
      activePollingStationsPercentage: 100, // Simulated
      recentChange: 0, // Simulated
      partywiseVotes,
      securityIncidents: {
        total: totalAlerts || 0,
        resolved: resolvedAlerts || 0,
        pending: (totalAlerts || 0) - (resolvedAlerts || 0),
        byType: {
          facialVerificationFailure: 0, // Would need specific query
          duplicateVoteAttempt: 0, // Would need specific query
          unauthorizedAccess: 0 // Would need specific query
        }
      },
      pendingFaceVerifications: pendingFaceVerifications || 0,
      failedOTPAttempts: recentFailedOTP || 0
    }

    return new Response(
      JSON.stringify({ success: true, stats }),
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
