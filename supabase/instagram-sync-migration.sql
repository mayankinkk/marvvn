CREATE TABLE IF NOT EXISTS instagram_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  synced INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE instagram_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sync logs" ON instagram_sync_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE INDEX idx_instagram_sync_log_completed_at ON instagram_sync_log(completed_at DESC);
