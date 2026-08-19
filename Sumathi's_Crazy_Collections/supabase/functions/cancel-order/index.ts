// supabase/functions/cancel-order/index.ts
// Cancels an order and restores product stock atomically.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.0';
import { corsResponse } from '../_shared/cors.ts';
import { rateLimit, getRateLimitKey } from '../_shared/rateLimit.ts';

interface ReqBody {
  orderId: number;
}

const rl = rateLimit('cancel-order', { maxRequests: 10, windowMs: 300_000 }); // 10 per 5 min

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

    // ── Validate payload ─────────────────────────────────
    const { orderId }: ReqBody = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Fetch the order & verify ownership ───────────────
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    if (order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: not your order' }), {
        status: 403,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // Only allow cancelling orders in cancellable states
    const CANCELLABLE_STATUSES = ['pending', 'payment_initiated', 'paid', 'processing'];
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return new Response(JSON.stringify({ error: 'This order cannot be cancelled' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Fetch order items to restore stock ───────────────
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (itemsErr) {
      return new Response(JSON.stringify({ error: 'Failed to fetch order items' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Restore stock for each item ──────────────────────
    if (items && items.length > 0) {
      for (const item of items) {
        const { error: stockErr } = await supabase.rpc('increment_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });

        // Fallback: if RPC doesn't exist, do a manual update
        if (stockErr) {
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (product) {
            await supabase
              .from('products')
              .update({ stock: product.stock + item.quantity })
              .eq('id', item.product_id);
          }
        }
      }
    }

    // ── Update order status to cancelled ─────────────────
    const { error: cancelErr } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (cancelErr) {
      return new Response(JSON.stringify({ error: 'Failed to cancel order' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...cors.headers, 'Content-Type': 'application/json' },
    });
  }
});
