CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new_arrival', 'abandoned_cart', 'custom')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns" ON whatsapp_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE INDEX idx_whatsapp_campaigns_type ON whatsapp_campaigns(type);
CREATE INDEX idx_whatsapp_campaigns_status ON whatsapp_campaigns(status);
CREATE INDEX idx_whatsapp_campaigns_created_at ON whatsapp_campaigns(created_at DESC);
