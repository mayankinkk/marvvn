-- Cart abandonment tracking table
CREATE TABLE IF NOT EXISTS cart_abandonment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'recovered', 'contacted', 'dismissed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_abandonment_status ON cart_abandonment(status);
CREATE INDEX IF NOT EXISTS idx_cart_abandonment_email ON cart_abandonment(email);
CREATE INDEX IF NOT EXISTS idx_cart_abandonment_created ON cart_abandonment(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_cart_abandonment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cart_abandonment_updated_at ON cart_abandonment;
CREATE TRIGGER cart_abandonment_updated_at
  BEFORE UPDATE ON cart_abandonment
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_abandonment_updated_at();

-- Mark as recovered when an order is placed with matching email
CREATE OR REPLACE FUNCTION mark_cart_recovered()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cart_abandonment
  SET status = 'recovered', updated_at = now()
  WHERE email = NEW.shipping_address->>'email'
    AND status = 'pending'
    AND created_at > now() - INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_mark_cart_recovered ON orders;
CREATE TRIGGER orders_mark_cart_recovered
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION mark_cart_recovered();
