CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public subscription form)
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow service role to read (admin dashboard)
CREATE POLICY "Allow service role read" ON newsletter_subscribers
  FOR SELECT
  USING (true);

-- Allow authenticated users to read their own
CREATE POLICY "Allow authenticated read own" ON newsletter_subscribers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
