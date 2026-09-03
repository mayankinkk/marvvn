import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BANNER_KEYS = [
  'hero_banner_1_image', 'hero_banner_1_mobile_image',
  'hero_banner_2_image', 'hero_banner_2_mobile_image',
  'hero_banner_3_image', 'hero_banner_3_mobile_image',
  'hero_banner_1_title', 'hero_banner_1_subtitle', 'hero_banner_1_link',
  'hero_banner_2_title', 'hero_banner_2_subtitle', 'hero_banner_2_link',
  'hero_banner_3_title', 'hero_banner_3_subtitle', 'hero_banner_3_link',
  'promo_1_image', 'promo_1_mobile_image',
  'promo_1_title', 'promo_1_subtitle', 'promo_1_link',
  'promo_2_image', 'promo_2_mobile_image',
  'promo_2_title', 'promo_2_subtitle', 'promo_2_link',
  'promo_3_image', 'promo_3_mobile_image',
  'promo_3_title', 'promo_3_subtitle', 'promo_3_link',
  'promo_4_image', 'promo_4_mobile_image',
  'promo_4_title', 'promo_4_subtitle', 'promo_4_link',
  'promo_5_image', 'promo_5_mobile_image',
  'promo_5_title', 'promo_5_subtitle', 'promo_5_link',
  'shop_mens_image', 'shop_womens_image',
  'brand_story_image',
]

export async function GET() {
  const supabase = createClient()

  const { data } = await supabase
    .from('store_settings')
    .select('key, value')
    .in('key', BANNER_KEYS)

  const banners: Record<string, string> = {}
  data?.forEach((row: any) => {
    banners[row.key] = row.value
  })

  return NextResponse.json({ banners })
}

export async function PUT(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { banners } = await request.json()

  const updates = Object.entries(banners)
    .filter(([key]) => BANNER_KEYS.includes(key))
    .map(([key, value]) => ({
      key,
      value: value as string,
      updated_at: new Date().toISOString(),
    }))

  for (const update of updates) {
    await supabase
      .from('store_settings')
      .upsert(update, { onConflict: 'key' })
  }

  return NextResponse.json({ success: true })
}
