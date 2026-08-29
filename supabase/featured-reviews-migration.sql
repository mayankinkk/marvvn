-- Add featured column to reviews table
-- Run in Supabase SQL Editor

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create index for faster featured review queries
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured) WHERE featured = true;
