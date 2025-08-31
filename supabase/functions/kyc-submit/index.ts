import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET') || 'secret');

async function verifyJWT(token: string) {
  try { return await verify(token, JWT_SECRET); } catch { return null; }
}

interface KycBody { fileName: string; contentType: string; base64Data: string; ivBase64: string; }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authorization token required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const token = authHeader.substring(7);
    const payload: any = await verifyJWT(token);
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = (await req.json()) as KycBody;
    if (!body?.fileName || !body?.base64Data || !body?.ivBase64) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Decode base64 to bytes
    const binaryString = atob(body.base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

    const path = `${payload.sub}/${Date.now()}-${body.fileName}.enc`;

    const { error: uploadError } = await supabase
      .storage.from('kyc-docs')
      .upload(path, new Blob([bytes], { type: 'application/octet-stream' }), { upsert: false, contentType: 'application/octet-stream' });

    if (uploadError) {
      console.error('Upload error', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to store document' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { error: insertError } = await supabase
      .from('kyc_verifications')
      .insert({ user_id: payload.sub, status: 'submitted', document_path: path, encrypted: true, encryption_iv: body.ivBase64 });

    if (insertError) {
      console.error('DB insert error', insertError);
      return new Response(JSON.stringify({ error: 'Failed to record KYC' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, document_path: path }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('kyc-submit error', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
