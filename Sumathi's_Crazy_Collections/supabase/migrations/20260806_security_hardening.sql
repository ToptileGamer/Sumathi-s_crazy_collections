-- ─────────────────────────────────────────────────────────────
-- SECURITY HARDENING MIGRATION
-- Project: Sumathi's Crazy Collections
--
-- How to apply:
--   1. Open your Supabase Dashboard → SQL Editor
--   2. Paste this entire file and run it.
--   (Or if you use the Supabase CLI: `supabase db push`)
--
-- What it does:
--   • Enables Row Level Security on every table
--   • Blocks non-admin users from changing the `role` column
--   • Users can only see/edit their own cart, wishlist, addresses,
--     orders, reviews and return requests
--   • Admins (role = 'admin') get full access to admin tables
--   • Anon users can only read products, categories, images & reviews
--   • Anon users can only see names/avatars on profiles (no phone/email)
--   • Storage: users can only upload into their own avatar folder;
--     product images are admin-write only
--
-- This file is idempotent: it can be run more than once safely.
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- 1. Admin helper function
--    SECURITY DEFINER + search_path pin to avoid recursion.
-- ═════════════════════════════════════════════════════════════
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ═════════════════════════════════════════════════════════════
-- 2. Enable RLS on all tables (idempotent)
-- ═════════════════════════════════════════════════════════════
alter table public.profiles          enable row level security;
alter table public.products          enable row level security;
alter table public.categories        enable row level security;
alter table public.product_images    enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.addresses         enable row level security;
alter table public.cart_items        enable row level security;
alter table public.wishlists         enable row level security;
alter table public.reviews           enable row level security;
alter table public.return_requests   enable row level security;

-- ═════════════════════════════════════════════════════════════
-- 3. Protect the `role` column — nobody can change roles from
--    the client. Only the service_role key (used by the
--    set-admin-role edge function / admin panel) may do so.
-- ═════════════════════════════════════════════════════════════
create or replace function public.protect_role_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), 'anon') <> 'service_role' then
    raise exception 'Changing the role column is not allowed from the client';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_role_column on public.profiles;
create trigger trg_protect_role_column
  before update on public.profiles
  for each row execute function public.protect_role_column();

-- ═════════════════════════════════════════════════════════════
-- 4. PROFILES
--    • authenticated users: own row only (read + edit name/phone/avatar)
--    • admins: read/write everything
--    • anon: column-granted name/avatar only (for review joins)
-- ═════════════════════════════════════════════════════════════
-- Column-level grants: anon can never see phone/email/role
revoke all on public.profiles from anon, authenticated;
grant select (id, full_name, avatar_url) on public.profiles to anon;
grant select (id, full_name, phone, avatar_url, role) on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

-- Anon: needed so public product pages can show reviewer names/avatars.
-- Column grants above limit anon to name/avatar only.
drop policy if exists "profiles_anon_read_public" on public.profiles;
create policy "profiles_anon_read_public" on public.profiles
  for select to anon
  using (true);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- 5. PRODUCTS / CATEGORIES / PRODUCT IMAGES
--    • everyone can read (storefront is public)
--    • only admins can write
-- ═════════════════════════════════════════════════════════════
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select to anon, authenticated
  using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated
  using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images
  for select to anon, authenticated
  using (true);

drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write" on public.product_images
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- 6. ORDERS
--    • users: read own, cancel own (status → 'cancelled' only)
--    • admins: read/update all (status management, etc.)
--    • INSERT happens server-side (edge functions) or via admin
-- ═════════════════════════════════════════════════════════════
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "orders_cancel_own" on public.orders;
create policy "orders_cancel_own" on public.orders
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and status = 'cancelled');

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- 7. ORDER ITEMS — visible through the owning order only
-- ═════════════════════════════════════════════════════════════
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- 8. ADDRESSES — owner only
-- ═════════════════════════════════════════════════════════════
drop policy if exists "addresses_own_all" on public.addresses;
create policy "addresses_own_all" on public.addresses
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "addresses_admin_all" on public.addresses;
create policy "addresses_admin_all" on public.addresses
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- 9. CART ITEMS — owner only
-- ═════════════════════════════════════════════════════════════
drop policy if exists "cart_items_own_all" on public.cart_items;
create policy "cart_items_own_all" on public.cart_items
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ═════════════════════════════════════════════════════════════
-- 10. WISHLISTS — owner only
-- ═════════════════════════════════════════════════════════════
drop policy if exists "wishlists_own_all" on public.wishlists;
create policy "wishlists_own_all" on public.wishlists
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ═════════════════════════════════════════════════════════════
-- 11. REVIEWS — public read, owner write, admin manage
-- ═════════════════════════════════════════════════════════════
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select to anon, authenticated
  using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- 12. RETURN REQUESTS — owner read/insert, admin manage
-- ═════════════════════════════════════════════════════════════
drop policy if exists "return_requests_select_own" on public.return_requests;
create policy "return_requests_select_own" on public.return_requests
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "return_requests_insert_own" on public.return_requests;
create policy "return_requests_insert_own" on public.return_requests
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "return_requests_admin_all" on public.return_requests;
create policy "return_requests_admin_all" on public.return_requests
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- IMPORTANT NOTES
--   • Signups create the profile row via the standard `handle_new_user`
--     trigger on auth.users. That trigger is SECURITY DEFINER, so it
--     keeps working after the REVOKE statements below. If you ever
--     replace it with a non-SECURITY DEFINER trigger, signups will
--     stop creating profiles.
--   • If you previously used the dashboard "Create policy → Allow all"
--     quickstart on storage.objects, those permissive policies are OR'd
--     with the new ones below. Delete any leftover "allow all" storage
--     policies in the dashboard for the avatars / product-images buckets.
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- 13. STORAGE
--     • avatars: users write only inside /<their-user-id>/,
--       everyone can read (public bucket)
--     • product-images: admin write only, public read
-- ═════════════════════════════════════════════════════════════
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- DONE. After running, verify in the dashboard:
--   Authentication → Policies — every table should show policies.
-- ═════════════════════════════════════════════════════════════
