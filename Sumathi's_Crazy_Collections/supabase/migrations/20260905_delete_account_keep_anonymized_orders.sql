-- ─────────────────────────────────────────────────────────────
-- ANONYMIZED ORDER RETENTION FOR ACCOUNT DELETION
-- Project: Sumathi's Crazy Collections
--
-- Why:
--   delete-account keeps order rows for legal/tax bookkeeping but
--   must still allow the auth user to be deleted (DPDP Act erasure).
--   With orders.user_id NOT NULL + a plain FK to auth.users, the
--   auth delete fails while orders exist.
--
--   This migration lets the edge function null out user_id and
--   address_id before deleting the auth user, keeping the order
--   rows (product name/price/quantity snapshots) without PII.
--   ON DELETE SET NULL is belt-and-braces for any other path that
--   deletes an auth user.
-- ─────────────────────────────────────────────────────────────

-- 1. Orders may outlive their user → column becomes nullable
alter table public.orders alter column user_id drop not null;

-- 2. If the auth user is ever deleted, keep the order but unlink it
alter table public.orders drop constraint if exists orders_user_id_fkey;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_user_id_fkey'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_user_id_fkey
      foreign key (user_id) references auth.users (id)
      on delete set null;
  end if;
end $$;
