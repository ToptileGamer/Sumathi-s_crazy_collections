// supabase/functions/verify-turnstile/index.ts
// Verifies a Cloudflare Turnstile token with Cloudflare's siteverify endpoint.
// Used to gate the contact / custom-order forms when TURNSTILE_SECRET_KEY is configured.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsResponse } from '../_shared/cors.ts';
import { rateLimit, getRateLimitKey } from '../_shared/rateLimit.ts';

const rl = rateLimit('verify-turnstile', { maxRequests: 30, windowMs: 60_000 }); // 30 per min per IP

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

  // ── Rate limit by IP (unauthenticated endpoint) ──────
  const rlResult = rl.check(getRateLimitKey(req));
  if (!rlResult.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { ...cors.headers, 'Content-Type': 'application/json', 'Retry-After': String(rlResult.retryAfterSec) },
    });
  }

  try {
    const secret = Deno.env.get('TURNSTILE_SECRET_KEY') ?? '';
    if (!secret) {
      return new Response(JSON.stringify({ success: false, error: 'Turnstile not configured' }), {
        status: 503,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Missing token' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: req.headers.get('x-forwarded-for') ?? '',
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: !!data.success, error: data['error-codes'] ?? null }), {
      status: 200,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message ?? 'Internal error' }), {
      status: 500,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  }
});
