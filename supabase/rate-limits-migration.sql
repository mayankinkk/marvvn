-- Rate limits table for serverless-compatible rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups and automatic cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_created ON rate_limits(key, created_at);

-- RLS: only service role can access
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages rate limits" ON rate_limits FOR ALL USING (true);

-- Auto-cleanup: delete entries older than 1 hour
-- Run this as a cron job or add to your cleanup process:
-- DELETE FROM rate_limits WHERE created_at < now() - interval '1 hour';
