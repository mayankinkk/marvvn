-- Feature migrations batch 1
-- Run in Supabase SQL Editor

-- 1. Add photos column to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- 2. Stock alerts table (for back-in-stock notifications)
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own stock alerts" ON stock_alerts FOR ALL USING (auth.uid() = user_id);

-- 3. Flash sale fields on products
ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_sale BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_sale_price NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_sale_ends_at TIMESTAMPTZ;

-- 4. Order status timeline
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;

-- 5. Return requests table
CREATE TABLE IF NOT EXISTS return_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own return requests" ON return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create return requests" ON return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage return requests" ON return_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 6. Blog SEO fields
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category TEXT;

-- 7. Product cross-sell / related products
ALTER TABLE products ADD COLUMN IF NOT EXISTS related_products UUID[] DEFAULT '{}';
