// supabase/functions/create-razorpay-order/main.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.0';
import Razorpay from 'npm:razorpay@^2.9.6';

interface CartItem {
  product_id: number;
  quantity: number;
}

interface ReqBody {
  cartItems: CartItem[];
  addressId: number;
  notes?: string;
}

serve(async (req) => {
  // ── CORS headers ─────────────────────────────────────────
  const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'http://localhost:3000,http://127.0.0.1:3000').split(',');
  const origin = req.headers.get('Origin') ?? '';
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ── DEBUG: step 1 ──
    console.log('STEP1: Starting function');
    
    // ── Authenticate via JWT ──────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('STEP2: Creating Supabase client');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const token = authHeader.split('Bearer ')[1];
    console.log('STEP3: Verifying user token');
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('STEP4: User authenticated: ' + user.id);
    
    // ── Validate payload ──────────────────────────────────
    const { cartItems, addressId, notes }: ReqBody = await req.json();
    if (!cartItems?.length || !addressId) {
      return new Response(JSON.stringify({ error: 'Missing cartItems or addressId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('STEP5: Fetching products, count=' + cartItems.length);
    
    // ── Fetch real product data from DB ──────────────────
    const productIds = cartItems.map((i) => i.product_id);
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds)
      .eq('is_active', true);

    if (prodErr) {
      console.log('PROD_ERR: ' + JSON.stringify(prodErr));
      return new Response(JSON.stringify({ error: 'Failed to fetch products: ' + prodErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (products.length !== new Set(productIds).size) {
      console.log('PROD_MISMATCH: found=' + products.length + ' expected=' + new Set(productIds).size);
      return new Response(JSON.stringify({ error: 'One or more products not found or inactive' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('STEP6: Calculating totals');
    
    // ── Validate stock & calculate totals ────────────────
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = productMap[item.product_id];
      if (!product) {
        return new Response(JSON.stringify({ error: `Product ${item.product_id} not found` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (product.stock < item.quantity) {
        return new Response(JSON.stringify({ error: `${product.name} is out of stock` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product_id:   product.id,
        product_name: product.name,
        price:        product.price,
        quantity:     item.quantity,
        line_total:   lineTotal,
      });
    }

    const shippingAmount = subtotal >= 999 ? 0 : 99;
    const totalAmount    = subtotal + shippingAmount;

    console.log('STEP7: Creating order, total=' + totalAmount);
    
    // ── Create order in Supabase ─────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id:         user.id,
        address_id:      addressId,
        status:          'payment_initiated',
        subtotal,
        shipping_amount: shippingAmount,
        total_amount:    totalAmount,
        payment_method:  'razorpay',
        notes:           notes ?? null,
      })
      .select()
      .single();

    if (orderErr) {
      console.log('ORDER_ERR: ' + JSON.stringify(orderErr));
      return new Response(JSON.stringify({ error: 'Failed to create order: ' + orderErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('STEP8: Order created, id=' + order.id);
    
    // ── Insert order items ──────────────────────────────
    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

    if (itemsErr) {
      console.log('ITEMS_ERR: ' + JSON.stringify(itemsErr));
      await supabase.from('orders').delete().eq('id', order.id);
      return new Response(JSON.stringify({ error: 'Failed to create order items: ' + itemsErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('STEP9: Creating Razorpay order');
    
    // ── Create Razorpay order ───────────────────────────
    const razorpay = new Razorpay({
      key_id:     Deno.env.get('RAZORPAY_KEY_ID') ?? '',
      key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') ?? '',
    });

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount:   Math.round(totalAmount * 100), // paise
        currency: 'INR',
        receipt:  `rcpt_${order.id}_${Date.now()}`,
        notes: {
          order_id: String(order.id),
          user_id:  user.id,
        },
      });
    } catch (_rpErr) {
      console.log('RAZORPAY_ERR: ' + JSON.stringify(_rpErr));
      await supabase.from('orders').delete().eq('id', order.id);
      return new Response(JSON.stringify({ error: 'Failed to create Razorpay order: ' + (_rpErr.message ?? _rpErr) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('STEP10: Razorpay order created, id=' + razorpayOrder.id);
    
    // ── Save Razorpay reference on the order ────────────
    await supabase.from('orders').update({ razorpay_order_id: razorpayOrder.id }).eq('id', order.id);

    // ── Respond ─────────────────────────────────────────
    const body = {
      keyId:           Deno.env.get('RAZORPAY_KEY_ID'),
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      orderId:         order.id,
      orderNumber:     order.order_number,
    };

    console.log('STEP11: Success, returning response');
    
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.log('FATAL_ERR: ' + (err.message ?? JSON.stringify(err)));
    console.log('FATAL_STACK: ' + (err.stack ?? 'no stack'));
    return new Response(JSON.stringify({ error: err.message ?? 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
