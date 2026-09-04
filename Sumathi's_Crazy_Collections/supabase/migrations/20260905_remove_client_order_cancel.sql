-- ─────────────────────────────────────────────────────────────
-- REMOVE CLIENT-SIDE ORDER CANCELLATION
-- Project: Sumathi's Crazy Collections
--
-- Why:
--   The `orders_cancel_own` policy let any authenticated user PATCH
--   their own order straight to status='cancelled' through the REST
--   API, bypassing the `cancel-order` edge function — so stock was
--   never restored via increment_stock and statuses like 'paid' /
--   'processing' could be cancelled silently.
--
--   The app always cancels through the edge function (service role,
--   RLS-bypassing), so this policy is not needed by any client flow.
--   Dropping it forces every cancellation to restore stock.
-- ─────────────────────────────────────────────────────────────

drop policy if exists "orders_cancel_own" on public.orders;
