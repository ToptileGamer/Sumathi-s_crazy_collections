// supabase/functions/create-cod-order/index.ts
// Server-side COD order creation — prices and stock are always read from the DB,
// never trusted from the client.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.0';
import { corsResponse } from '../_shared/cors.ts';
import { rateLimit, getRateLimitKey } from '../_shared/rateLimit.ts';
import { errorMessage } from '../_shared/errors.ts';

interface CartItem {
  product_id: number;
  quantity: number;
}

interface ReqBody {
  cartItems: CartItem[];
  addressId: number;
  notes?: string;
}

const rl = rateLimit('create-cod-order', { maxRequests: 5, windowMs: 300_000 }); // 5 per 5 min

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

    // ── Validate payload ──────────────────────────────────
    const { cartItems, addressId, notes }: ReqBody = await req.json();
    if (!cartItems?.length || !addressId) {
      return new Response(JSON.stringify({ error: 'Missing cartItems or addressId' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Verify the address belongs to this user ───────────
    const { data: addr, error: addrErr } = await supabase
      .from('addresses')
      .select('id')
      .eq('id', addressId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (addrErr || !addr) {
      return new Response(JSON.stringify({ error: 'Address not found for this user' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Fetch real product data from DB ──────────────────
    const productIds = cartItems.map((i) => i.product_id);
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, price, stock, product_images(url, is_primary)')
      .in('id', productIds)
      .eq('is_active', true);

    if (prodErr) {
      console.error('PROD_ERR: ' + JSON.stringify(prodErr));
      return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }
    if (products.length !== new Set(productIds).size) {
      return new Response(JSON.stringify({ error: 'One or more products not found or inactive' }), {
        status: 400,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Validate stock & calculate totals ────────────────
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = productMap[item.product_id];
      if (!product) {
        return new Response(JSON.stringify({ error: `Product ${item.product_id} not found` }), {
          status: 400,
          headers: { ...cors.headers, 'Content-Type': 'application/json' },
        });
      }
      if (product.stock < item.quantity) {
        return new Response(JSON.stringify({ error: `${product.name} is out of stock` }), {
          status: 400,
          headers: { ...cors.headers, 'Content-Type': 'application/json' },
        });
      }
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      // Pick the primary image URL, falling back to the first image
      const images = product.product_images ?? [];
      const primaryImg = images.find((img: any) => img.is_primary) ?? images[0];
      const productImage = primaryImg?.url ?? null;

      // NOTE: line_total is a GENERATED column in the DB (price * quantity),
      // so it must NOT be inserted explicitly — Postgres would reject the row.
      orderItems.push({
        product_id:     product.id,
        product_name:   product.name,
        product_image:  productImage,
        price:          product.price,
        quantity:       item.quantity,
      });
    }

    // ── Free shipping on the customer's first 5 orders ──────
    // Cancelled orders don't count toward the perk, so a customer
    // doesn't lose a free-shipping slot for something they returned.
    const { count: placedCount, error: countErr } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('status', 'cancelled');

    const FREE_SHIPPING_ORDER_LIMIT = 5;
    const orderCount                = countErr ? 0 : (placedCount ?? 0);
    const freeShippingPerk          = orderCount < FREE_SHIPPING_ORDER_LIMIT;
    const shippingAmount            = freeShippingPerk || subtotal >= 999 ? 0 : 99;
    const totalAmount               = subtotal + shippingAmount;

    // ── Create order ─────────────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id:         user.id,
        address_id:      addressId,
        status:          'pending',
        subtotal,
        shipping_amount: shippingAmount,
        gst_amount:      0,
        total_amount:    totalAmount,
        payment_method:  'cod',
        notes:           notes ?? null,
      })
      .select()
      .single();

    if (orderErr) {
      console.error('ORDER_ERR: ' + JSON.stringify(orderErr));
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Insert order items ──────────────────────────────
    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

    if (itemsErr) {
      console.error('ITEMS_ERR: ' + JSON.stringify(itemsErr));
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
      return new Response(JSON.stringify({ error: 'Failed to create order items' }), {
        status: 500,
        headers: { ...cors.headers, 'Content-Type': 'application/json' },
      });
    }

    // ── Reserve stock (atomic, server-side) ─────────────
    // decrement_stock is defined in the stock_management migration and is
    // service-role only. If it is missing (migration not yet applied), fall
    // back to a guarded manual update. On any failure, roll the order back.
    for (const item of orderItems) {
      const { error: stockErr } = await supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity:   item.quantity,
      });

      if (stockErr) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (!product || product.stock < item.quantity) {
          console.error('STOCK_ERR: ' + JSON.stringify(stockErr));
          await supabase.from('order_items').delete().eq('order_id', order.id);
          await supabase.from('orders').delete().eq('id', order.id);
          return new Response(JSON.stringify({ error: 'Insufficient stock. Please try again.' }), {
            status: 400,
            headers: { ...cors.headers, 'Content-Type': 'application/json' },
          });
        }

        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id);
      }
    }

    // ── Clear the user's cart ───────────────────────────
    await supabase.from('cart_items').delete().eq('user_id', user.id);

    return new Response(JSON.stringify({ success: true, order }), {
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
