// supabase/functions/delete-account/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.0';
import { corsResponse } from '../_shared/cors.ts';
import { rateLimit, getRateLimitKey } from '../_shared/rateLimit.ts';
import { errorMessage } from '../_shared/errors.ts';

const rl = rateLimit('delete-account', { maxRequests: 3, windowMs: 3_600_000 }); // 3 per hour

serve(async (req) => {
  const cors = corsResponse(req);

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors.headers });

  if (!cors.allowed) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ── Authenticate via JWT ──────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const token = authHeader.split('Bearer ')[1];
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Rate limit ──────────────────────────────────────
    const rlResult = rl.check(getRateLimitKey(req, user.id));
    if (!rlResult.allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...cors.headers, 'Content-Type': 'application/json', 'Retry-After': String(rlResult.retryAfterSec) },
      });
    }

    // ── Erase user data (every step is checked) ──────────
    // Order history is KEPT for legal/tax reasons, but anonymized:
    // user_id and address_id are nulled so the order rows (product
    // name/price/quantity snapshots) no longer carry PII and no
    // longer block deletion of the auth user or the addresses.
    const fail = (step: string, err: unknown): Response => {
      console.error(step + '_ERR: ' + JSON.stringify(err));
      return new Response(JSON.stringify({ error: 'Failed to delete account data. Please try again or contact support.' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    };

    const del = async (step: string, table: string) => {
      const { error } = await supabase.from(table).delete().eq('user_id', user.id);
      if (error) return fail(step, error);
      return null;
    };

    for (const [step, table] of [
      ['CART_DELETE', 'cart_items'],
      ['WISHLIST_DELETE', 'wishlists'],
      ['RETURN_DELETE', 'return_requests'],
      ['REVIEW_DELETE', 'reviews'],
    ] as const) {
      const r = await del(step, table);
      if (r) return r;
    }

    // Unlink orders BEFORE deleting addresses / auth user
    const { error: anonErr } = await supabase
      .from('orders')
      .update({ user_id: null, address_id: null })
      .eq('user_id', user.id);
    if (anonErr) return fail('ORDER_ANONYMISE', anonErr);

    const addrDel = await del('ADDRESS_DELETE', 'addresses');
    if (addrDel) return addrDel;

    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);
    if (profileErr) return fail('PROFILE_DELETE', profileErr);

    // ── Strict erasure: delete avatar files from storage ─
    // (DPDP Act — data must be erased from servers too, not just the DB)
    const { data: avatarFiles } = await supabase.storage
      .from('avatars')
      .list(user.id);
    if (avatarFiles && avatarFiles.length > 0) {
      const { error: avErr } = await supabase.storage
        .from('avatars')
        .remove(avatarFiles.map((f) => `${user.id}/${f.name}`));
      if (avErr) return fail('AVATAR_DELETE', avErr);
    }

    // ── Delete the actual Auth user (uses service role) ──
    // Requires the delete-account migration (orders.user_id nullable)
    // so the anonymising UPDATE above succeeds first.
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteErr) {
      console.error('DELETE_ERR: ' + JSON.stringify(deleteErr));
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: errorMessage(err) }), {
      status: 500,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  }
});
