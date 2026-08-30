-- Add per-product What You Get and Size & Fit content
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS what_you_get jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS size_fit_text text DEFAULT '';
