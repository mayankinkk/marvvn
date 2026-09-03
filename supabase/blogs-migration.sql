-- Blogs table migration
-- Run in Supabase SQL Editor
-- Creates the blogs table if it doesn't exist, and ensures RLS policies are in place

-- Create table if not exists
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT DEFAULT '',
  image TEXT NOT NULL,
  author TEXT DEFAULT 'MARVVN',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT true,
  category TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if table already existed but missing them
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'MARVVN';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Public can read published blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON blogs;

-- Public can read published blogs
CREATE POLICY "Public can read published blogs" ON blogs
  FOR SELECT USING (published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage blogs" ON blogs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blogs_handle ON blogs (handle);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs (published);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs (created_at DESC);
