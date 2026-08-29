-- Seed the original 3 reviews as featured
-- Run in Supabase SQL Editor AFTER running featured-reviews-migration.sql

INSERT INTO reviews (name, text, rating, featured, verified)
VALUES
  ('Tamchi Nyakum', 'It was so much worthy than buying a ₹1400 t-shirt from H&M or Zara. The quality was better and was the aesthetic!', 5, true, true),
  ('Saumya Raj', 'I Just love it. The quality is premium and i bought XS and it fits me best. I have been dying to get a billie ellish tee in India but always worried about quality but you can surely go for this one.', 5, true, true),
  ('Ansh Jadli', 'Change your name to quality.com I swear i lovedddddddd the quality so so so much Thanks MARVVN', 5, true, true);
