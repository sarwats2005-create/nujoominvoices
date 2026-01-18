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

// Validate identifier format (email or IP)
const isValidIdentifier = (identifier: string): boolean => {
  // Email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // IP pattern (IPv4 and IPv6)
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return (emailPattern.test(identifier) || ipv4Pattern.test(identifier) || ipv6Pattern.test(identifier)) 
    && identifier.length <= 320; // Max email length
};

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

    // Validate identifier format
    if (!isValidIdentifier(identifier)) {
      return new Response(
        JSON.stringify({ error: 'Invalid identifier format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Rate limit ${action} for ${attemptType}: ${identifier.substring(0, 3)}***`);

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
      // Fail closed for security - block the request if rate limiting fails
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          blocked: true,
          remainingSeconds: 60 // Suggest retry after 1 minute
        }),
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

    console.log('Rate limit check completed');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail closed for security
    return new Response(
      JSON.stringify({ 
        error: 'Service temporarily unavailable', 
        allowed: false, 
        blocked: true,
        remainingSeconds: 60
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
