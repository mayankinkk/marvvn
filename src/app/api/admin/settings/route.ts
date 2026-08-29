import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

const ALLOWED_KEYS = new Set([
  'store_name', 'store_description', 'store_email', 'store_phone', 'store_address',
  'currency', 'currency_symbol', 'tax_rate', 'free_shipping_threshold', 'shipping_fee',
  'whatsapp_number', 'instagram_url', 'facebook_url', 'twitter_url', 'youtube_url',
  'logo_url', 'banner_url', 'primary_color', 'accent_color',
  'maintenance_mode', 'maintenance_message', 'order_email_enabled', 'low_stock_threshold',
  'seo_title', 'seo_description', 'seo_keywords', 'announcement_bar', 'mega_menu',
  'hero_banner_1_title', 'hero_banner_1_subtitle', 'hero_banner_1_link',
  'hero_banner_2_title', 'hero_banner_2_subtitle', 'hero_banner_2_link',
  'hero_banner_3_title', 'hero_banner_3_subtitle', 'hero_banner_3_link',
  'popular_searches',
  'invoice_logo_url', 'invoice_gst_number', 'invoice_gst_percentage',
  'invoice_footer_text', 'invoice_terms', 'invoice_show_logo', 'invoice_show_gst', 'invoice_prefix',
  'invoice_return_policy', 'site_url',
  'inv_invoice_label', 'inv_order_label', 'inv_date_label',
  'inv_bill_to_label', 'inv_payment_label', 'inv_method_label', 'inv_status_label',
  'inv_product_label', 'inv_variant_label', 'inv_qty_label', 'inv_rate_label', 'inv_amount_label',
  'inv_subtotal_label', 'inv_discount_label', 'inv_shipping_label', 'inv_free_label', 'inv_total_label',
  'inv_coupon_label', 'inv_you_saved_label', 'inv_return_policy_label', 'inv_scan_label',
  'inv_demo_discount', 'inv_demo_coupon', 'inv_demo_gst',
  'inv_demo_name', 'inv_demo_address', 'inv_demo_email', 'inv_demo_phone',
  'inv_demo_product', 'inv_demo_variant', 'inv_demo_qty', 'inv_demo_rate',
  'blog_page_heading', 'blog_page_subtitle', 'blog_categories',
])

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
  whatsapp_number: '',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  logo_url: '',
  banner_url: '',
  primary_color: '#000000',
  accent_color: '#666666',
  maintenance_mode: 'false',
  maintenance_message: 'We are currently under maintenance. Please check back later.',
  order_email_enabled: 'true',
  low_stock_threshold: '5',
  seo_title: 'MARVVN - Premium Streetwear',
  seo_description: 'Shop premium streetwear, oversized t-shirts, and more at MARVVN',
  seo_keywords: 'streetwear, oversized tees, marvvn, fashion',
  announcement_bar: '⚡︎NOT MADE TO FIT IN | BUILT FOR THE REAL ONES ⚡︎',
  popular_searches: JSON.stringify(['Oversized T-Shirt', 'Joggers', 'Marvel', 'Cargos', 'Caps']),
  invoice_logo_url: '',
  invoice_gst_number: '',
  invoice_gst_percentage: '12',
  invoice_footer_text: 'NOT MADE TO FIT IN. | BUILT FOR THE REAL ONES.',
  invoice_terms: '',
  invoice_return_policy: 'Return accepted within 3 days of delivery • Product must be unused & undamaged • Delivery charges are non-refundable • Damaged/used products are not accepted • Refund after quality inspection',
  invoice_show_logo: 'true',
  invoice_show_gst: 'true',
  invoice_prefix: 'INV',
  site_url: 'https://marvvn.online',
  inv_invoice_label: 'TAX INVOICE',
  inv_order_label: 'Order',
  inv_date_label: 'Date',
  inv_bill_to_label: 'Bill To',
  inv_payment_label: 'Payment Details',
  inv_method_label: 'Method',
  inv_status_label: 'Status',
  inv_product_label: 'Product',
  inv_variant_label: 'Variant',
  inv_qty_label: 'Qty',
  inv_rate_label: 'Rate',
  inv_amount_label: 'Amount',
  inv_subtotal_label: 'Subtotal',
  inv_discount_label: 'Discount',
  inv_shipping_label: 'Shipping',
  inv_free_label: 'FREE',
  inv_total_label: 'TOTAL',
  inv_coupon_label: 'Coupon Applied',
  inv_you_saved_label: 'You saved',
  inv_return_policy_label: 'Return Policy',
  inv_scan_label: 'Scan to view order online',
  inv_demo_discount: '200',
  inv_demo_coupon: 'MARVVN10',
  inv_demo_gst: '240',
  inv_demo_name: 'Rahul Sharma',
  inv_demo_address: '45 MG Road, Sector 14',
  inv_demo_email: 'rahul@gmail.com',
  inv_demo_phone: '9876543210',
  inv_demo_product: 'MARVVN Oversized Tee',
  inv_demo_variant: 'Black / M',
  inv_demo_qty: '2',
  inv_demo_rate: '999',
  blog_page_heading: 'Our Blog',
  blog_page_subtitle: 'Stories, style guides, and behind-the-scenes from the MARVVN world',
  blog_categories: JSON.stringify([
    { slug: 'style-guide', label: 'Style Guide' },
    { slug: 'brand-story', label: 'Brand Story' },
    { slug: 'streetwear', label: 'Streetwear' },
    { slug: 'behind-the-scenes', label: 'Behind the Scenes' },
    { slug: 'collaborations', label: 'Collaborations' },
  ]),
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

export async function GET() {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase.from('store_settings').select('*')
  if (error) {
    return NextResponse.json({ settings: DEFAULTS })
  }

  const settings: Record<string, string> = { ...DEFAULTS }
  ;(data || []).forEach((row: any) => {
    if (ALLOWED_KEYS.has(row.key)) {
      settings[row.key] = row.value
    }
  })

  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { settings } = body

  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ error: 'Invalid settings' }, { status: 400 })
  }

  const filteredEntries = Object.entries(settings).filter(([key]) => ALLOWED_KEYS.has(key))

  if (filteredEntries.length === 0) {
    return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })
  }

  for (const [key, value] of filteredEntries) {
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key, value: String(value) }, { onConflict: 'key' })
    if (error) {
      console.error(`Failed to save setting ${key}:`, error.message, error.details, error.hint)
      return NextResponse.json({ error: `Failed to save: ${key}`, details: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
