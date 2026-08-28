-- Run this SQL in Supabase SQL Editor to update WhatsApp number
INSERT INTO store_settings (key, value)
VALUES ('whatsapp_number', '917578017237')
ON CONFLICT (key) DO UPDATE SET value = '917578017237';
