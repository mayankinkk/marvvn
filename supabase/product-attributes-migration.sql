-- Add per-product attributes for product detail page
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS fabric_composition text DEFAULT '',
  ADD COLUMN IF NOT EXISTS gsm text DEFAULT '',
  ADD COLUMN IF NOT EXISTS waist text DEFAULT '',
  ADD COLUMN IF NOT EXISTS length text DEFAULT '',
  ADD COLUMN IF NOT EXISTS model_info text DEFAULT '';
