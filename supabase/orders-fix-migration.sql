-- Add payment_id column to orders table for Razorpay payment tracking
-- Run this in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Atomic stock decrement function (prevents race conditions)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock INTO current_stock FROM products WHERE id = p_product_id FOR UPDATE;
  IF current_stock IS NULL OR current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;
  UPDATE products SET stock = current_stock - p_quantity WHERE id = p_product_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
