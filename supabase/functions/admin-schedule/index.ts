
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

    if (req.method === 'GET') {
      // Get current voting schedule, create default if missing
      const { data: schedule, error } = await supabase
        .from('voting_schedule')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('Database error (GET):', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch schedule' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!schedule) {
        const { data: inserted, error: insertErr } = await supabase
          .from('voting_schedule')
          .insert({ id: 1, is_active: false })
          .select()
          .single();
        if (insertErr) {
          console.error('Database error (insert default schedule):', insertErr);
          return new Response(
            JSON.stringify({ error: 'Failed to initialize schedule' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ success: true, schedule: inserted }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, schedule }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'PATCH') {
      // Update voting schedule
      const { votingStart, votingEnd, isActive } = await req.json();

      if (!votingStart || !votingEnd) {
        return new Response(
          JSON.stringify({ error: 'Voting start and end times are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const startDate = new Date(votingStart);
      const endDate = new Date(votingEnd);

      if (startDate >= endDate) {
        return new Response(
          JSON.stringify({ error: 'Voting start time must be before end time' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Try update first
      let scheduleResp = await supabase
        .from('voting_schedule')
        .update({
          voting_start: startDate.toISOString(),
          voting_end: endDate.toISOString(),
          is_active: isActive !== undefined ? isActive : false,
          updated_by: payload.sub
        })
        .eq('id', 1)
        .select()
        .maybeSingle();

      if (!scheduleResp.data) {
        // If no row, insert
        const insertResp = await supabase
          .from('voting_schedule')
          .insert({
            id: 1,
            voting_start: startDate.toISOString(),
            voting_end: endDate.toISOString(),
            is_active: isActive !== undefined ? isActive : false,
            updated_by: payload.sub
          })
          .select()
          .single();
        if (insertResp.error) {
          console.error('Database error (insert schedule):', insertResp.error);
          return new Response(
            JSON.stringify({ error: 'Failed to update schedule' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        scheduleResp = insertResp;
      } else if (scheduleResp.error) {
        console.error('Database error (update schedule):', scheduleResp.error);
        return new Response(
          JSON.stringify({ error: 'Failed to update schedule' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Voting schedule updated successfully',
          schedule: scheduleResp.data,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
