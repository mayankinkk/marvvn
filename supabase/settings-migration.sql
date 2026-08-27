-- Store settings table for admin configuration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are viewable by everyone" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON store_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Insert default settings
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'MARVVN'),
  ('store_description', 'Premium streetwear and oversized tees'),
  ('currency', 'INR'),
  ('currency_symbol', '₹'),
  ('tax_rate', '0'),
  ('free_shipping_threshold', '999'),
  ('shipping_fee', '99'),
  ('low_stock_threshold', '5'),
  ('order_email_enabled', 'true'),
  ('maintenance_mode', 'false'),
  ('maintenance_message', 'We are currently under maintenance. Please check back later.'),
  ('seo_title', 'MARVVN - Premium Streetwear'),
  ('seo_description', 'Shop premium streetwear, oversized t-shirts, and more at MARVVN'),
  ('seo_keywords', 'streetwear, oversized tees, marvvn, fashion'),
  ('primary_color', '#000000'),
  ('accent_color', '#666666')
ON CONFLICT (key) DO NOTHING;
