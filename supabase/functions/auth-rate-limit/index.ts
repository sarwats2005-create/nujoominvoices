import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRequest {
  identifier: string;
  attemptType: 'login' | 'signup' | 'password_reset';
  action: 'check' | 'clear';
}

interface RateLimitResponse {
  allowed: boolean;
  blocked: boolean;
  blockedUntil?: string;
  remainingSeconds?: number;
  attemptsRemaining?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: RateLimitRequest = await req.json();
    const { identifier, attemptType, action } = body;

    if (!identifier || !attemptType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate attempt type
    if (!['login', 'signup', 'password_reset'].includes(attemptType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid attempt type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Rate limit ${action} for ${attemptType}: ${identifier}`);

    if (action === 'clear') {
      // Clear rate limit after successful auth
      const { error } = await supabase.rpc('clear_rate_limit', {
        p_identifier: identifier.toLowerCase(),
        p_attempt_type: attemptType,
      });

      if (error) {
        console.error('Error clearing rate limit:', error);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier.toLowerCase(),
      p_attempt_type: attemptType,
      p_max_attempts: attemptType === 'login' ? 5 : 3,
      p_window_minutes: 15,
      p_block_minutes: attemptType === 'login' ? 30 : 60,
    });

    if (error) {
      console.error('Error checking rate limit:', error);
      // Fail open - allow the request if rate limiting fails
      return new Response(
        JSON.stringify({ allowed: true, blocked: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response: RateLimitResponse = {
      allowed: data.allowed,
      blocked: data.blocked,
      blockedUntil: data.blocked_until,
      remainingSeconds: data.remaining_seconds,
      attemptsRemaining: data.attempts_remaining,
    };

    console.log('Rate limit response:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Rate limit error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', allowed: true, blocked: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
