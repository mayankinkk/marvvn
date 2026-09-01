-- Scheduled emails: automated post-purchase email queue
-- Stores emails to be sent at a future time (review requests, win-back, etc.)

CREATE TABLE IF NOT EXISTS scheduled_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN (
    'review_request',
    'win_back',
    'post_delivery_followup'
  )),
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scheduled_emails_pending ON scheduled_emails(scheduled_for)
  WHERE sent = false;
CREATE INDEX idx_scheduled_emails_order_id ON scheduled_emails(order_id);
CREATE INDEX idx_scheduled_emails_user_id ON scheduled_emails(user_id);
CREATE INDEX idx_scheduled_emails_type ON scheduled_emails(email_type);
