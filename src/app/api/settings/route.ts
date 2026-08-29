import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULTS: Record<string, string> = {
  store_name: 'MARVVN',
  store_description: 'Premium streetwear and oversized tees',
  store_email: 'marvvnclothing@gmail.com',
  store_phone: '7578017237',
  store_address: 'Faridabad',
  currency: 'INR',
  currency_symbol: '₹',
  tax_rate: '0',
  free_shipping_threshold: '999',
  shipping_fee: '65',
  whatsapp_number: '917578017237',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  logo_url: '',
  primary_color: '#000000',
  accent_color: '#666666',
  announcement_bar: '⚡︎NOT MADE TO FIT IN | BUILT FOR THE REAL ONES ⚡︎',
  maintenance_mode: 'false',
  maintenance_message: 'We are currently under maintenance. Please check back later.',
  seo_title: 'MARVVN | Unisex Luxury Streetwear Clothing Brand',
  seo_description: 'Luxury streetwear clothing brand for men and women. Shop oversized t-shirts, joggers, hoodies, and more.',
  seo_keywords: 'streetwear, oversized t-shirts, joggers, hoodies, marvvn',
  popular_searches: JSON.stringify(['Oversized T-Shirt', 'Joggers', 'Marvel', 'Cargos', 'Caps']),
  mega_menu: JSON.stringify([
    {
      title: 'Women',
      columns: [
        { title: 'Categories', links: [
          { label: 'New Arrivals', href: '/collections/womens-new-arrivals' },
          { label: 'Oversized T-Shirts', href: '/collections/oversized-t-shirt-women' },
          { label: 'Bottoms', href: '/collections/womens-bottoms' },
          { label: 'Tanks', href: '/collections/tanks-women' },
          { label: 'Cargos', href: '/collections/cargo-womens' },
          { label: 'Joggers', href: '/collections/joggers-womens' },
          { label: 'GYM Wear', href: '/collections/womens-gym-wear' },
          { label: 'Tops', href: '/collections/tops-women' },
          { label: 'Hoodies', href: '/collections/womens-hoodie' },
          { label: 'Sweatshirts', href: '/collections/womens-sweatshirt' },
          { label: 'Jeans', href: '/collections/jeans-for-women' },
          { label: 'Basics', href: '/collections/basics-women' },
          { label: 'Jackets', href: '/collections/jacket-women' },
          { label: 'Dress', href: '/collections/dress' },
          { label: 'CO-ORD Sets', href: '/collections/co-ord-sets' },
          { label: 'Shorts', href: '/collections/womens-shorts' },
        ]},
        { title: 'Collections', links: [
          { label: 'Freestyle Collection', href: '/collections/freestyle-women' },
          { label: 'Stripe', href: '/collections/womens-stripe' },
          { label: 'Summer Society', href: '/collections/summer-society-women' },
          { label: 'Drift Collection', href: '/collections/drift-collection-womens' },
          { label: 'Delulu Collection', href: '/collections/womens-delulu-collection' },
          { label: 'The Lifting Club', href: '/collections/the-lifting-club-women' },
          { label: 'Sigilism Collection', href: '/collections/womens-sigilism-collection' },
          { label: 'MARVVN SkyClub', href: '/collections/bonkers-skyclub-women' },
          { label: 'Polyamide', href: '/collections/polyamide-collection' },
          { label: 'Seamless', href: '/collections/seamless' },
        ]},
        { title: 'Collaborations', links: [
          { label: 'Marvel', href: '/collections/marvel-women' },
          { label: 'HotWheels', href: '/collections/hot-wheels-women' },
          { label: 'Red Bull', href: '/collections/red-bull-women' },
          { label: 'Harry Potter', href: '/collections/harry-potter-women' },
          { label: 'Naruto', href: '/collections/naruto-women' },
          { label: 'Disney', href: '/collections/disney-collection-women' },
          { label: 'DC', href: '/collections/dc-women' },
          { label: 'Looney Tunes', href: '/collections/looney-tunes-women' },
          { label: 'SpongeBob', href: '/collections/spongebob-women' },
          { label: 'Hello Kitty', href: '/collections/hellokitty' },
          { label: 'Playboy', href: '/collections/playboy-women' },
        ]},
      ],
    },
    {
      title: 'Men',
      columns: [
        { title: 'Categories', links: [
          { label: 'New Arrivals', href: '/collections/mens-new-arrivals' },
          { label: 'Oversized T-Shirts', href: '/collections/oversized-t-shirt-men' },
          { label: 'Bottoms', href: '/collections/mens-bottoms' },
          { label: 'The Knit Edit', href: '/collections/mens-knitwear-edition' },
          { label: 'Tanks', href: '/collections/tanks-mens' },
          { label: 'Cargos', href: '/collections/mens-cargo' },
          { label: 'Joggers', href: '/collections/joggers-mens' },
          { label: 'Gym Wear', href: '/collections/gym-wear-for-mens' },
          { label: 'Shorts', href: '/collections/shorts-men' },
          { label: 'Jeans', href: '/collections/jeans-men' },
          { label: 'Hoodies', href: '/collections/mens-hoodie' },
          { label: 'Sweatshirts', href: '/collections/mens-sweatshirts' },
          { label: 'Jackets', href: '/collections/jacket-men' },
          { label: 'Oversized Shirts', href: '/collections/oversized-shirt-men' },
          { label: 'Polo', href: '/collections/polo-men' },
        ]},
        { title: 'Collections', links: [
          { label: 'Freestyle Collection', href: '/collections/freestyle-men' },
          { label: 'Stripe', href: '/collections/mens-stripe' },
          { label: 'Summer Society', href: '/collections/summer-society-men' },
          { label: 'Drift Collection', href: '/collections/drift-collection-mens' },
          { label: 'Delulu Collection', href: '/collections/mens-delulu-collection' },
          { label: 'The Lifting Club', href: '/collections/the-lifting-club-men' },
          { label: 'The Knit Edit', href: '/collections/mens-knitwear-edition' },
          { label: 'Corduroy', href: '/collections/corduroy' },
          { label: 'Supima', href: '/collections/supima-men' },
        ]},
        { title: 'Collaborations', links: [
          { label: 'Marvel', href: '/collections/marvel-men' },
          { label: 'HotWheels', href: '/collections/hot-wheels-mens' },
          { label: 'Red Bull', href: '/collections/red-bull-men' },
          { label: 'Harry Potter', href: '/collections/harry-potter-men' },
          { label: 'Naruto', href: '/collections/naruto-men' },
          { label: 'Disney', href: '/collections/disney-collection-men' },
          { label: 'DC', href: '/collections/dc-men' },
          { label: 'Looney Tunes', href: '/collections/looney-tunes-men' },
          { label: 'SpongeBob', href: '/collections/spongebob-men' },
          { label: 'Playboy', href: '/collections/playboy-men' },
        ]},
      ],
    },
    {
      title: 'Accessories',
      columns: [
        { title: 'Categories', links: [
          { label: 'Socks', href: '/collections/socks' },
          { label: 'Tote', href: '/collections/tote' },
          { label: 'Bags', href: '/collections/bags' },
          { label: 'Bag Charm', href: '/collections/bag-charm' },
          { label: 'Caps', href: '/collections/caps' },
          { label: 'Rug', href: '/collections/rug' },
          { label: 'Stickers', href: '/collections/stickers' },
          { label: 'Scarf', href: '/collections/scarf' },
        ]},
      ],
    },
  ]),
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()

  const { data } = await supabase.from('store_settings').select('key, value')

  const settings: Record<string, string> = { ...DEFAULTS }
  ;(data || []).forEach((row: any) => {
    settings[row.key] = row.value
  })

  return NextResponse.json(settings)
}
