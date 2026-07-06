import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://esm.sh/bcryptjs@2.4.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PIN_RE = /^[0-9]{4,6}$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing auth' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userRes } = await userClient.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await req.json();
    const { action, vault_id, pin, new_pin } = body || {};
    if (!action || !vault_id) return json({ error: 'Invalid request' }, 400);

    // Load vault (bypasses RLS via service role but scoped by user_id)
    const { data: vault } = await supabase.from('vaults').select('*').eq('id', vault_id).eq('user_id', user.id).single();
    if (!vault) return json({ error: 'Vault not found' }, 404);

    const rateId = `vault:${user.id}:${vault_id}`;

    if (action === 'set_pin') {
      if (!PIN_RE.test(new_pin || '')) return json({ error: 'PIN must be 4-6 digits' }, 400);
      const hash = await bcrypt.hash(new_pin, 10);
      await supabase.from('vaults').update({ pin_hash: hash }).eq('id', vault_id);
      return json({ ok: true });
    }

    if (action === 'remove_pin') {
      // Requires current PIN if one is set
      if (vault.pin_hash) {
        if (!PIN_RE.test(pin || '')) return json({ error: 'Enter current PIN' }, 400);
        const ok = await bcrypt.compare(pin, vault.pin_hash);
        if (!ok) return json({ error: 'Wrong PIN' }, 401);
      }
      await supabase.from('vaults').update({ pin_hash: null }).eq('id', vault_id);
      return json({ ok: true });
    }

    if (action === 'open_vault' || action === 'close_vault' || action === 'verify_pin') {
      // Rate limit
      const { data: rl } = await supabase.rpc('check_rate_limit', {
        p_identifier: rateId, p_attempt_type: 'vault_pin', p_max_attempts: 5, p_window_minutes: 15, p_block_minutes: 30,
      });
      if (rl && rl.blocked) {
        return json({ error: 'Too many attempts. Try later.', blocked_until: rl.blocked_until }, 429);
      }
      if (vault.pin_hash) {
        if (!PIN_RE.test(pin || '')) return json({ error: 'Enter PIN' }, 400);
        const ok = await bcrypt.compare(pin, vault.pin_hash);
        if (!ok) return json({ error: 'Wrong PIN' }, 401);
      }
      await supabase.rpc('clear_rate_limit', { p_identifier: rateId, p_attempt_type: 'vault_pin' });
      if (action === 'open_vault') {
        await supabase.from('vaults').update({ is_open: true }).eq('id', vault_id);
      } else if (action === 'close_vault') {
        await supabase.from('vaults').update({ is_open: false }).eq('id', vault_id);
      }
      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e?.message || 'Server error' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
