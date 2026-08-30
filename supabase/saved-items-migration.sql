-- Save for Later items table
-- Separate from cart and wishlist — items saved from cart for later purchase

CREATE TABLE IF NOT EXISTS saved_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, size, color)
);

-- RLS policies
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved items"
  ON saved_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved items"
  ON saved_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved items"
  ON saved_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved items"
  ON saved_items FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
