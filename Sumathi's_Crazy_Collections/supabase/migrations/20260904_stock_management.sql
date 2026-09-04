-- ─────────────────────────────────────────────────────────────
-- STOCK MANAGEMENT RPCs
-- Project: Sumathi's Crazy Collections
--
-- How to apply:
--   1. Open your Supabase Dashboard → SQL Editor
--   2. Paste this entire file and run it.
--   (Or if you use the Supabase CLI: `supabase db push`)
--
-- Why:
--   • create-cod-order must DECREASE stock atomically when an order is placed.
--   • cancel-order must INCREASE stock atomically when an order is cancelled.
--   • Both run in the edge functions with the service-role key. The functions
--     are REVOKED from anon/authenticated so clients can never change stock
--     directly through the REST API — only the edge functions may.
-- ─────────────────────────────────────────────────────────────

-- ── decrement_stock: reserve stock for a new order ───────────
-- Raises an exception (no row updated) if there isn't enough stock,
-- so the caller can roll the order back.
-- NOTE: product ids in this schema are uuid (products.id), so the
-- parameter types are uuid, not bigint.
create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock = stock - p_quantity
  where id = p_product_id and stock >= p_quantity;

  if not found then
    raise exception 'Insufficient stock for product %', p_product_id;
  end if;
end;
$$;

-- ── increment_stock: restore stock when an order is cancelled ─
create or replace function public.increment_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock = stock + p_quantity
  where id = p_product_id;

  if not found then
    raise exception 'Product % not found', p_product_id;
  end if;
end;
$$;

-- ── Lock down: only the service role (edge functions) may call ─
-- (If an older decrement_stock(uuid, int) exists from a manual dashboard
--  paste, drop it first — CREATE OR REPLACE cannot rename parameters.)
revoke execute on function public.decrement_stock(uuid, integer) from public, anon, authenticated;
revoke execute on function public.increment_stock(uuid, integer) from public, anon, authenticated;
grant execute on function public.decrement_stock(uuid, integer) to service_role;
grant execute on function public.increment_stock(uuid, integer) to service_role;