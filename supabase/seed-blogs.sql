-- Seed the 3 hardcoded blog posts into the database
-- Run in Supabase SQL Editor (after blogs-migration.sql)
-- Uses ON CONFLICT so it's safe to run multiple times

INSERT INTO blogs (handle, title, excerpt, content, image, author, tags, published, created_at)
VALUES
  (
    'gift-ideas-for-raksha-bandhan',
    'Gift Ideas for Raksha Bandhan: Celebrate Your Sibling Bond in MARVVN Style',
    'Raksha Bandhan just got better. Explore stylish gift ideas for your sibling, from oversized T-shirts and cargos to co-ords, bags and accessories.',
    '',
    '/images/blog/post-1.svg',
    'MARVVN',
    ARRAY['gifting', 'raksha-bandhan', 'style'],
    true,
    '2026-08-22T00:00:00Z'
  ),
  (
    'how-to-style-cargo-pants',
    'How to Style Cargo Pants for an Effortlessly Balanced Look',
    'Cargo pants are doing the heavy lifting literally. From oversized streetwear fits to polished everyday looks, discover easy ways to style cargos.',
    '',
    '/images/blog/post-2.svg',
    'MARVVN',
    ARRAY['cargo', 'styling', 'menswear'],
    true,
    '2026-08-13T00:00:00Z'
  ),
  (
    'spiderman-movie-outfit-ideas',
    'What to Wear to the Spider-Man Movie: Spiderman Outfit Ideas',
    'Your ticket is booked now complete the mission! Explore Spider-Man movie outfit ideas that will have every Marvel fan turning heads.',
    '',
    '/images/blog/post-3.svg',
    'MARVVN',
    ARRAY['marvel', 'spiderman', 'outfit'],
    true,
    '2026-07-25T00:00:00Z'
  )
ON CONFLICT (handle) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  image = EXCLUDED.image,
  author = EXCLUDED.author,
  tags = EXCLUDED.tags,
  published = EXCLUDED.published;
