-- Multi-size inventory: per-variant stock tracking
-- Each product can have multiple variants (size x color combination)

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, size, color)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_stock ON product_variants(stock);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_variants_updated_at();

-- RPC: Decrement variant stock atomically
CREATE OR REPLACE FUNCTION decrement_variant_stock(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock INTO current_stock
  FROM product_variants
  WHERE product_id = p_product_id AND size = p_size AND color = p_color
  FOR UPDATE;

  IF current_stock IS NULL OR current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE product_variants
  SET stock = current_stock - p_quantity
  WHERE product_id = p_product_id AND size = p_size AND color = p_color;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- RPC: Increment variant stock atomically (for cancellations/returns)
CREATE OR REPLACE FUNCTION increment_variant_stock(
  p_product_id UUID,
  p_size TEXT,
  p_color TEXT,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE product_variants
  SET stock = stock + p_quantity
  WHERE product_id = p_product_id AND size = p_size AND color = p_color;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing stock data: create variants from existing sizes/colors with split stock
-- This runs once to seed variant data from the existing flat stock
-- Only runs if the stock column exists on products table
DO $$
DECLARE
  product RECORD;
  size TEXT;
  color TEXT;
  variant_count INTEGER;
  stock_per_variant INTEGER;
  has_stock_column BOOLEAN;
BEGIN
  -- Check if stock column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock'
  ) INTO has_stock_column;

  IF NOT has_stock_column THEN
    -- No stock column, create variants with 0 stock
    FOR product IN
      SELECT id, sizes, colors
      FROM products
      WHERE array_length(sizes, 1) > 0
        AND NOT EXISTS (SELECT 1 FROM product_variants WHERE product_id = products.id)
    LOOP
      FOREACH size IN ARRAY product.sizes LOOP
        FOREACH color IN ARRAY product.colors LOOP
          INSERT INTO product_variants (product_id, size, color, stock)
          VALUES (product.id, size, color, 0)
          ON CONFLICT (product_id, size, color) DO NOTHING;
        END LOOP;
      END LOOP;
    END LOOP;
  ELSE
    -- Stock column exists, seed from it
    FOR product IN
      SELECT id, sizes, colors, stock
      FROM products
      WHERE stock IS NOT NULL AND stock > 0
        AND array_length(sizes, 1) > 0
        AND NOT EXISTS (SELECT 1 FROM product_variants WHERE product_id = products.id)
    LOOP
      variant_count := array_length(product.sizes, 1) * array_length(product.colors, 1);
      IF variant_count > 0 THEN
        stock_per_variant := GREATEST(1, product.stock / variant_count);
        FOREACH size IN ARRAY product.sizes LOOP
          FOREACH color IN ARRAY product.colors LOOP
            INSERT INTO product_variants (product_id, size, color, stock)
            VALUES (product.id, size, color, stock_per_variant)
            ON CONFLICT (product_id, size, color) DO NOTHING;
          END LOOP;
        END LOOP;
      END IF;
    END LOOP;
  END IF;
END $$;
