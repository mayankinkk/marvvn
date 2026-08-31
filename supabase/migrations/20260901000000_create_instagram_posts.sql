-- Instagram Posts table for managing feed content
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  link TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active posts
CREATE POLICY "Public can view active instagram posts" ON instagram_posts
  FOR SELECT USING (is_active = true);

-- Allow authenticated users full access (admin)
CREATE POLICY "Authenticated users can manage instagram posts" ON instagram_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for sorting
CREATE INDEX idx_instagram_posts_sort_order ON instagram_posts(sort_order);
CREATE INDEX idx_instagram_posts_active ON instagram_posts(is_active);
