-- ─────────────────────────────────────────────────────────────
-- LIVE SECURITY FIXES (discovered during review)
-- Project: Sumathi's Crazy Collections
--
-- 1. Orders must ONLY be created by the create-cod-order edge
--    function (service role). The leftover client-INSERT policies
--    (from the old Razorpay flow) let any authenticated user POST
--    fabricated orders AND order_items straight through the REST
--    API — arbitrary totals, status 'paid', no stock reservation.
--    The app never inserts orders client-side, so these policies
--    are safe to drop. Admins keep their ALL policies.
--
-- 2. profiles.role could be set at INSERT time by a client whose
--    signup trigger never created a profile row (e.g. historical
--    users). Add a BEFORE INSERT guard that forces role to
--    'customer' unless the writer is the service role.
-- ─────────────────────────────────────────────────────────────

-- 1. Client order fabrication
drop policy if exists "Users create own orders" on public.orders;
drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "Users insert own order items" on public.order_items;
drop policy if exists "order_items_insert_service" on public.order_items;

-- 2. No self-elevation via profile INSERT
create or replace function public.protect_role_column_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role (edge functions) may set any role; clients may only
  -- ever create themselves as 'customer'.
  if coalesce(auth.role(), 'anon') <> 'service_role' then
    new.role := 'customer';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_role_column_insert on public.profiles;
create trigger trg_protect_role_column_insert
  before insert on public.profiles
  for each row execute function public.protect_role_column_insert();
