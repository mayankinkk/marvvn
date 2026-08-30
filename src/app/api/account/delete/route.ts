import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const tables = [
    'cart_items', 'wishlist', 'orders', 'return_requests',
    'support_tickets', 'ticket_messages', 'reviews', 'newsletter_subscribers',
    'stock_alerts', 'abandoned_carts', 'profiles'
  ]

  for (const table of tables) {
    try {
      await admin.from(table).delete().eq('user_id', user.id)
    } catch {}
    if (table === 'newsletter_subscribers' || table === 'abandoned_carts') {
      try {
        await admin.from(table).delete().eq('email', user.email || '')
      } catch {}
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
