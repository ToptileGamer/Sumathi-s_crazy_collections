-- ─────────────────────────────────────────────────────────────
-- ADD MISSING COLUMNS TO ORDERS TABLE
-- Project: Sumathi's Crazy Collections
--
-- How to apply:
--   1. Open your Supabase Dashboard → SQL Editor
--   2. Paste this entire file and run it.
-- ─────────────────────────────────────────────────────────────

-- gst_amount: GST tax calculated on subtotal
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gst_amount numeric NOT NULL DEFAULT 0;

-- notes: optional order notes from the customer
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS notes text;

-- order_number: human-readable order number (e.g. SCC-00001)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'order_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN order_number text;
  END IF;
END $$;

-- Auto-generate order_number on insert
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num int;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(order_number, '[^0-9]', '', 'g'), '')::int), 0) + 1
    INTO next_num
    FROM public.orders;
  NEW.order_number := 'SCC-' || LPAD(next_num::text, 5, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_order_number ON public.orders;
CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();
