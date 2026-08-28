import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULTS: Record<string, string> = {
  store_name: 'MARVVN',
  store_description: 'Premium streetwear and oversized tees',
  store_email: 'support@marvvn.online',
  store_phone: '',
  store_address: 'India',
  currency: 'INR',
  currency_symbol: '₹',
  tax_rate: '0',
  free_shipping_threshold: '999',
  shipping_fee: '99',
  whatsapp_number: '917578017237',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  logo_url: '',
  primary_color: '#000000',
  accent_color: '#666666',
  maintenance_mode: 'false',
  maintenance_message: 'We are currently under maintenance. Please check back later.',
  seo_title: 'MARVVN | Unisex Luxury Streetwear Clothing Brand',
  seo_description: 'Luxury streetwear clothing brand for men and women. Shop oversized t-shirts, joggers, hoodies, and more.',
  seo_keywords: 'streetwear, oversized t-shirts, joggers, hoodies, marvvn',
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
