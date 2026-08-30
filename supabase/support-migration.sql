-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('order_issue', 'delivery', 'return', 'payment', 'product', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  order_id TEXT,
  admin_reply TEXT,
  bot_handled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Messages table (chat thread)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- RLS policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets (for closing)
CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can read messages on their own tickets
CREATE POLICY "Users can view own ticket messages" ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Users can insert messages on their own tickets
CREATE POLICY "Users can add messages to own tickets" ON ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Service role full access (for admin and bot)
CREATE POLICY "Service role full access tickets" ON support_tickets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access messages" ON ticket_messages
  FOR ALL USING (true) WITH CHECK (true);
