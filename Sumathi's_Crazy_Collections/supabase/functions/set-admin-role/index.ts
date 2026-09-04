// supabase/functions/set-admin-role/index.ts
// Promotes/demotes a user's role. Only an existing admin can perform this action,
// and it must go through this edge function (client-side role writes are blocked by RLS).
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.0';
import { corsResponse } from '../_shared/cors.ts';
import { rateLimit, getRateLimitKey } from '../_shared/rateLimit.ts';
import { errorMessage } from '../_shared/errors.ts';

interface ReqBody {
  userId: string;
  role: 'admin' | 'customer';
}

const VALID_ROLES = ['admin', 'customer'];

const rl = rateLimit('set-admin-role', { maxRequests: 20, windowMs: 60_000 }); // 20 per min

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

    // ── Verify caller is an admin ─────────────────────────
    const { data: caller, error: callerErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (callerErr || !caller || caller.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: admin privileges required' }), {
        status: 403,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Rate limit (admin-keyed) ───────────────────────
    const rlResult = rl.check(getRateLimitKey(req, user.id));
    if (!rlResult.allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...cors.headers, 'Content-Type': 'application/json', 'Retry-After': String(rlResult.retryAfterSec) },
      });
    }

    // ── Validate payload ──────────────────────────────────
    const { userId, role }: ReqBody = await req.json();
    if (!userId || !VALID_ROLES.includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid userId or role' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }
    if (userId === user.id) {
      return new Response(JSON.stringify({ error: 'You cannot change your own role' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Update the target profile's role ─────────────────
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select('id, full_name, role')
      .single();

    if (error) {
      console.error('ROLE_ERR: ' + JSON.stringify(error));
      return new Response(JSON.stringify({ error: 'Failed to update role' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, profile: data }), {
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
