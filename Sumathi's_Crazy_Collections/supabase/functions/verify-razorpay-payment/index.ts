// supabase/functions/verify-razorpay-payment/main.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.0';
import { corsResponse } from '../_shared/cors.ts';
import { rateLimit, getRateLimitKey } from '../_shared/rateLimit.ts';

interface ReqBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: number;
}

const rl = rateLimit('verify-razorpay-payment', { maxRequests: 10, windowMs: 300_000 }); // 10 per 5 min

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
    // ── Authenticate ─────────────────────────────────────
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

    // ── Validate payload ─────────────────────────────────
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }: ReqBody = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return new Response(JSON.stringify({ error: 'Missing required payment fields' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Verify Razorpay signature (HMAC-SHA256) ─────────
    const keyBytes = new TextEncoder().encode(Deno.env.get('RAZORPAY_KEY_SECRET') ?? '');
    const dataBytes = new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Payment signature verification failed' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Update order status ─────────────────────────────
    const { data: order, error: updateErr } = await supabase
      .from('orders')
      .update({
        status:              'paid',
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq('id', order_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateErr) {
      console.error('UPDATE_ERR: ' + JSON.stringify(updateErr));
      return new Response(JSON.stringify({ error: 'Failed to update order status' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Clear the user's cart ───────────────────────────
    await supabase.from('cart_items').delete().eq('user_id', user.id);

    return new Response(JSON.stringify({ success: true, order }), {
      status: 200,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message ?? 'Internal error' }), {
      status: 500,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  }
});
