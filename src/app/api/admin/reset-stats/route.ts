import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { confirm, scope } = body

  // Safety: require typed confirmation
  if (confirm !== 'RESET') {
    return NextResponse.json({ error: 'Confirmation required. Type RESET to confirm.' }, { status: 400 })
  }

  // Only allow known scopes for now; default to orders (revenue) reset
  const allowedScopes = new Set(['orders'])
  const targetScope = scope || 'orders'
  if (!allowedScopes.has(targetScope)) {
    return NextResponse.json({ error: 'Invalid scope' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    if (targetScope === 'orders') {
      // Delete all orders — cascades to order_items, return_requests, order_notes, scheduled_emails via FK
      // Use neq with dummy UUID to match all rows (Supabase requires a filter)
      const { error, count } = await admin
        .from('orders')
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error

      // Also clear abandoned_carts if they exist (optional, not counted in dashboard but keeps stats clean)
      // Don't fail if table doesn't exist
      try {
        await admin.from('abandoned_carts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      } catch {}

      return NextResponse.json({ success: true, deletedOrders: count ?? 0, scope: targetScope })
    }

    return NextResponse.json({ error: 'Unsupported scope' }, { status: 400 })
  } catch (err: any) {
    console.error('Reset stats failed:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Failed to reset stats' }, { status: 500 })
  }
}
