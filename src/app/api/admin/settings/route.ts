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
])

const DEFAULTS: Record<string, string> = {
  store_name: 'MARVVN',
  store_description: 'Premium streetwear and oversized tees',
  store_email: '',
  store_phone: '',
  store_address: '',
  currency: 'INR',
  currency_symbol: '₹',
  tax_rate: '0',
  free_shipping_threshold: '999',
  shipping_fee: '99',
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
  mega_menu: '[]',
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

  const updates = filteredEntries.map(([key, value]) => ({
    key,
    value: String(value),
  }))

  const { error } = await supabase
    .from('store_settings')
    .upsert(updates, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })

  return NextResponse.json({ success: true })
}
