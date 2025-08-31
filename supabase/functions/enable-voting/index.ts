
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Enable voting schedule for testing
    const now = new Date()
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
    
    const { data, error } = await supabase
      .from('voting_schedule')
      .upsert({
        id: 1,
        is_active: true,
        voting_start: now.toISOString(),
        voting_end: endTime.toISOString(),
        updated_at: now.toISOString()
      })
      .select()

    if (error) {
      console.error('Error enabling voting:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to enable voting' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Voting enabled successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Voting enabled successfully',
        schedule: data[0]
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
