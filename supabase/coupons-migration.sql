-- Coupons table for promo code management
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_cart NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons are viewable by everyone" ON coupons FOR SELECT USING (true);
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- Insert some default coupons
INSERT INTO coupons (code, discount_type, discount_value, min_cart, active) VALUES
  ('SHARKTANK10', 'percentage', 10, 500, true),
  ('WELCOME10', 'percentage', 10, 0, true),
  ('MARVVN15', 'percentage', 15, 1000, true),
  ('FLAT20', 'percentage', 20, 1500, true)
ON CONFLICT (code) DO NOTHING;
