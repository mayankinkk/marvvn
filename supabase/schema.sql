-- MARVVN Database Schema
-- Run this in your Supabase SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('men', 'women', 'accessories')),
  collection TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  badge TEXT CHECK (badge IN ('new', 'sale', 'bestseller')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total NUMERIC(10,2) NOT NULL,
  discount NUMERIC(5,2) DEFAULT 0,
  promo_code TEXT,
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color TEXT,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cart table (persistent server-side cart)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, size, color)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read, service role can write
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products insertable by service role" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products updatable by service role" ON products FOR UPDATE USING (true);
CREATE POLICY "Products deletable by service role" ON products FOR DELETE USING (true);

-- Orders: users can read their own
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: users can read their own
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Cart: users can manage their own
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Wishlist: users can manage their own
CREATE POLICY "Users can view own wishlist" ON wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Indexes
CREATE INDEX idx_products_handle ON products(handle);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_collection ON products USING GIN(collection);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);

-- Seed products (run once)
INSERT INTO products (handle, title, description, price, compare_at_price, images, category, collection, tags, sizes, colors, is_new, is_bestseller, badge)
VALUES
  ('camo-star-oversized-t-shirt', 'Camo Star Oversized T-shirt', 'Bold camo star print oversized t-shirt crafted from premium cotton.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/1_jpg_800x.jpg?v=1787746719'], 'women', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['camo', 'star', 'oversized'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['Green'], true, false, 'sale'),
  ('local-celebrity-oversized-t-shirt', 'Local Celebrity Oversized T-shirt', 'Be the local celebrity in this bold oversized tee.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/LocalCelebrityOversizedT-shirt4_800x.jpg?v=1787825540'], 'women', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['celebrity', 'oversized'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black'], true, false, 'sale'),
  ('charcoal-blur-pants', 'Charcoal Blur Pants', 'Premium charcoal blur pants for a sleek streetwear look.', 1499, 1899, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/15_655517a2-e65a-465b-98dd-5ad60800b4dd_800x.jpg?v=1787832274'], 'men', ARRAY['new-arrivals', 'bottoms'], ARRAY['charcoal', 'pants'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Charcoal'], true, false, 'sale'),
  ('dash-denim-jacket', 'Dash Denim Jacket', 'Classic denim jacket with a modern oversized fit.', 2299, 2399, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/Dashdenimjacket_8_800x.jpg?v=1787567371'], 'women', ARRAY['new-arrivals', 'jackets'], ARRAY['denim', 'jacket'], ARRAY['S', 'M', 'L', 'XL'], ARRAY['Blue'], true, false, 'new'),
  ('edge-line-baggy-fit-jeans', 'Edge Line Baggy Fit Jeans', 'Relaxed baggy fit jeans with edge line detailing.', 1899, 1999, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/EdgeLineBaggyFitJeans_2_800x.jpg?v=1787568639'], 'men', ARRAY['new-arrivals', 'jeans'], ARRAY['baggy', 'jeans'], ARRAY['28', '30', '32', '34', '36'], ARRAY['Blue'], true, false, 'sale'),
  ('motion-frequency-jacket', 'Motion Frequency Jacket', 'Premium motion frequency jacket with technical fabric.', 2999, 3199, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/File14_800x.png?v=1787391971'], 'men', ARRAY['new-arrivals', 'jackets'], ARRAY['jacket', 'technical'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black'], true, false, 'sale'),
  ('flushing-pink-trackline-joggers', 'Flushing Pink Trackline Joggers', 'Vibrant pink joggers with trackline detailing.', 1499, 1899, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/FlushingPinktracklinejoggers_7_800x.jpg?v=1787286820'], 'women', ARRAY['new-arrivals', 'joggers'], ARRAY['pink', 'joggers'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Pink'], true, false, 'sale'),
  ('moddy-blue-trackline-joggers', 'Moddy Blue Trackline Joggers', 'Premium blue joggers for effortless streetwear style.', 1499, 1899, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/ModdyBlueTracklineJoggers_9_0a463989-82ed-4371-b610-31e19d713ce8_800x.jpg?v=1787286397'], 'men', ARRAY['new-arrivals', 'joggers'], ARRAY['blue', 'joggers'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Blue'], true, false, 'sale'),
  ('black-loose-fit-joggers', 'Black Loose Fit Joggers', 'Classic black loose fit joggers for everyday comfort.', 1299, 1599, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/BlackLooseFitJoggers_3_800x.png?v=1783420776'], 'men', ARRAY['best-sellers', 'joggers'], ARRAY['black', 'joggers'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black'], false, true, 'bestseller'),
  ('olive-tape-wide-leg-joggers', 'Olive Tape Wide Leg Joggers', 'Wide leg joggers with tape detailing in olive.', 1299, 1599, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/OliveTapeWideLegJoggers_4_800x.png?v=1784794518'], 'men', ARRAY['best-sellers', 'joggers'], ARRAY['olive', 'joggers'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Olive'], false, true, 'bestseller'),
  ('everyday-sailor-stripe-oversized-t-shirt', 'Everyday Sailor Stripe Oversized T-shirt', 'Nautical-inspired sailor stripe oversized tee.', 1099, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/EverydaySailorStripeOversizedT-shirt_5_800x.jpg?v=1786083989'], 'men', ARRAY['best-sellers', 'oversized-t-shirts'], ARRAY['stripe', 'sailor', 'oversized'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Navy', 'White'], false, true, 'bestseller'),
  ('black-faded-loose-fit-pants', 'Black Faded Loose Fit Pants', 'Faded black loose fit pants for a vintage look.', 1499, 1799, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/black-faded-loose-fit-pants-xs-bonkerscorner-store-33695629443172_8f2479fb-0aa3-4f13-a5c0-5d618a68d9cd_800x.jpg?v=1773819043'], 'women', ARRAY['women', 'bottoms'], ARRAY['black', 'faded', 'pants'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black'], false, false, NULL),
  ('black-wide-leg-sweatpants', 'Black Wide-Leg Sweatpants', 'Comfortable wide-leg sweatpants in black.', 1199, 1499, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/preview_images/9bcf2aa5b920488e890222519957c2a7.thumbnail.0000000000_800x.jpg?v=1773832456'], 'women', ARRAY['women', 'bottoms'], ARRAY['black', 'sweatpants'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black'], false, false, NULL),
  ('sand-beige-wide-leg-sweatpants', 'Sand Beige Wide-Leg Sweatpants', 'Soft sand beige wide-leg sweatpants.', 1199, 1499, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/preview_images/cb1cfb2b132d438fb6432318934bb144.thumbnail.0000000000_800x.jpg?v=1773833326'], 'women', ARRAY['women', 'bottoms'], ARRAY['beige', 'sweatpants'], ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Beige'], false, false, NULL),
  ('kid-98-cap', 'Kid 98 Cap', 'Classic 98 cap with kid branding.', 799, 1099, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/01_f0bc4625-2505-4593-bdda-b2925af63756_800x.png?v=1787293179'], 'accessories', ARRAY['caps'], ARRAY['cap', 'kid'], ARRAY['One Size'], ARRAY['Black'], false, false, 'sale'),
  ('soft-yellow-oversized-t-shirt', 'Soft Yellow Oversized T-shirt', 'Soft yellow oversized t-shirt for a fresh summer look.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/SoftYellowOversizedT-shirt_2_800x.png?v=1787831460'], 'men', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['yellow', 'oversized'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Yellow'], true, false, 'sale'),
  ('iron-grey-oversized-t-shirt', 'Iron Grey Oversized T-shirt', 'Premium iron grey oversized t-shirt.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/IronGreyOversizedT-shirt_2_800x.png?v=1787829068'], 'men', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['grey', 'oversized'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Grey'], true, false, 'sale'),
  ('blissful-blue-loose-fit-joggers', 'Blissful Blue Loose Fit Joggers', 'Comfortable blue loose fit joggers.', 1299, 1599, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/BlissfulBlueLooseFitJoggers_1_148f9233-4125-451b-b9d7-cc06e8942d86_800x.jpg?v=1787295206'], 'men', ARRAY['new-arrivals', 'joggers'], ARRAY['blue', 'joggers'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Blue'], true, false, 'sale'),
  ('ninja-oversized-t-shirt', 'Ninja Oversized T-shirt', 'Stealth-inspired ninja graphic oversized tee.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/NinjaOversizedT-shirt_2_800x.jpg?v=1787828213'], 'men', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['ninja', 'oversized'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black'], true, false, 'sale'),
  ('rust-oversized-t-shirt', 'Rust Oversized T-shirt', 'Earthy rust-toned oversized t-shirt.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/RustOversizedT-shirt_2_800x.png?v=1787829826'], 'men', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['rust', 'oversized'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Rust'], true, false, 'sale'),
  ('white-oversized-t-shirt', 'White Essentials Oversized T-shirt', 'Clean white oversized tee for everyday wear.', 899, 1199, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/WhiteEssentialsOversizedT-shirt_2_800x.png?v=1787830556'], 'men', ARRAY['best-sellers', 'oversized-t-shirts'], ARRAY['white', 'oversized', 'essential'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White'], false, true, 'bestseller'),
  ('racing-green-cargo-joggers', 'Racing Green Cargo Joggers', 'Utility-inspired cargo joggers in racing green.', 1499, 1799, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/RacingGreenCargoJoggers_2_800x.jpg?v=1787294119'], 'men', ARRAY['new-arrivals', 'joggers'], ARRAY['green', 'cargo', 'joggers'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Green'], true, false, 'sale'),
  ('shadow-oversized-t-shirt', 'Shadow Oversized T-shirt', 'Dark shadow graphic oversized t-shirt.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/ShadowOversizedT-shirt_2_800x.jpg?v=1787830166'], 'women', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['shadow', 'oversized'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black'], true, false, 'sale'),
  ('dark-green-oversized-t-shirt', 'Dark Green Oversized T-shirt', 'Rich dark green oversized tee.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/DarkGreenOversizedT-shirt_2_800x.png?v=1787828778'], 'women', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['green', 'oversized'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['Green'], true, false, 'sale'),
  ('black-relaxed-fit-cargos', 'Black Relaxed Fit Cargos', 'Relaxed fit cargo pants in black.', 1699, 1999, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/BlackRelaxedFitCargos_2_800x.jpg?v=1787293651'], 'men', ARRAY['best-sellers', 'bottoms'], ARRAY['black', 'cargo', 'pants'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black'], false, true, 'bestseller'),
  ('cream-relaxed-fit-cargos', 'Cream Relaxed Fit Cargos', 'Comfortable cream cargo pants for a relaxed look.', 1699, 1999, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/CreamRelaxedFitCargos_2_800x.jpg?v=1787293420'], 'men', ARRAY['new-arrivals', 'bottoms'], ARRAY['cream', 'cargo', 'pants'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Cream'], true, false, 'sale'),
  ('red-oversized-t-shirt', 'Red Oversized T-shirt', 'Bold red oversized tee to make a statement.', 999, 1299, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/RedOversizedT-shirt_2_800x.png?v=1787829964'], 'women', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['red', 'oversized'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['Red'], true, false, 'sale'),
  ('butterfly-oversized-t-shirt', 'Butterfly Oversized T-shirt', 'Delicate butterfly print oversized tee.', 1099, 1399, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/ButterflyOversizedT-shirt_2_800x.jpg?v=1787826347'], 'women', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['butterfly', 'oversized'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['White'], true, false, 'new'),
  ('black-oversized-hoodie', 'Black Oversized Hoodie', 'Premium heavyweight black oversized hoodie.', 2499, 2999, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/BlackOversizedHoodie_2_800x.jpg?v=1787292936'], 'men', ARRAY['best-sellers', 'sweatshirts-hoodies'], ARRAY['black', 'hoodie', 'oversized'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black'], false, true, 'bestseller'),
  ('grey-oversized-sweatshirt', 'Grey Oversized Sweatshirt', 'Cozy grey oversized sweatshirt for layering.', 1999, 2499, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/GreyOversizedSweatshirt_2_800x.jpg?v=1787295024'], 'men', ARRAY['new-arrivals', 'sweatshirts-hoodies'], ARRAY['grey', 'sweatshirt', 'oversized'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Grey'], true, false, 'sale'),
  ('zip-through-hoodie', 'Zip Through Hoodie', 'Classic zip-through hoodie in navy.', 2199, 2599, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/ZipThroughHoodie_2_800x.jpg?v=1787295799'], 'men', ARRAY['new-arrivals', 'sweatshirts-hoodies'], ARRAY['zip', 'hoodie'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Navy'], true, false, 'sale'),
  ('looney-tunes-oversized-t-shirt', 'Looney Tunes Oversized T-shirt', 'Fun Looney Tunes collab oversized tee.', 1199, 1499, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/LooneyTunesOversizedT-shirt_2_800x.jpg?v=1787827670'], 'women', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['looney', 'tunes', 'oversized', 'anime'], ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'], ARRAY['White'], true, false, 'new'),
  ('marvel-spider-man-oversized-t-shirt', 'Marvel Spider-Man Oversized T-shirt', 'Spider-Man marquee oversized tee for Marvel fans.', 1299, 1599, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/MarvelSpiderManOversizedT-shirt_2_800x.jpg?v=1787827985'], 'men', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['spider-man', 'marvel', 'oversized', 'anime'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Red'], true, false, 'new'),
  ('knitted-beanie', 'Knitted Beanie', 'Cozy knitted beanie to complete your streetwear fit.', 599, 899, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/KnittedBeanie_2_800x.jpg?v=1787293938'], 'accessories', ARRAY['caps'], ARRAY['beanie', 'knitted'], ARRAY['One Size'], ARRAY['Black'], false, false, 'sale'),
  ('red-bull-x-marvvn-oversized-t-shirt', 'Red Bull x MARVVN Oversized T-shirt', 'Official Red Bull collaboration oversized tee.', 1499, 1799, ARRAY['https://www.bonkerscorner.com/cdn/shop/files/RedBullxMARVVNOversizedT-shirt_2_800x.jpg?v=1787829601'], 'men', ARRAY['new-arrivals', 'oversized-t-shirts'], ARRAY['red-bull', 'collab', 'oversized'], ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Navy'], true, false, 'new')
ON CONFLICT (handle) DO NOTHING;
