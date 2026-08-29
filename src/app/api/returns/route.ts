import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReturnRequestEmail } from '@/lib/email'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

// Customer: create return request
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, reason } = await request.json()
  if (!orderId || !reason) return NextResponse.json({ error: 'Order ID and reason required' }, { status: 400 })

  // Verify order belongs to user
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status === 'cancelled') return NextResponse.json({ error: 'Cannot return a cancelled order' }, { status: 400 })

  // Check if return already requested
  const { data: existing } = await supabase
    .from('return_requests')
    .select('id')
    .eq('order_id', orderId)
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .single()

  if (existing) return NextResponse.json({ error: 'Return already requested for this order' }, { status: 400 })

  const { data, error } = await supabase
    .from('return_requests')
    .insert({ order_id: orderId, user_id: user.id, reason })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create return request' }, { status: 500 })

  return NextResponse.json({ returnRequest: data }, { status: 201 })
}

// Admin: list all return requests; Customer: list own
export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (await isAdmin(supabase)) {
    const { data } = await supabase
      .from('return_requests')
      .select('*, orders(total, shipping_address)')
      .order('created_at', { ascending: false })
    return NextResponse.json({ returns: data || [] })
  }

  const { data } = await supabase
    .from('return_requests')
    .select('*, orders(total)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return NextResponse.json({ returns: data || [] })
}

// Admin: update return status
export async function PUT(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status, admin_notes } = await request.json()
  if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 })

  const admin = createAdminClient()

  const { data: returnReq, error } = await admin
    .from('return_requests')
    .update({ status, admin_notes: admin_notes || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, orders(id, user_id, shipping_address)')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  // Send email notification
  if (returnReq.orders?.shipping_address?.email) {
    await sendReturnRequestEmail(
      returnReq.orders.shipping_address.email,
      returnReq.orders.id,
      status,
      admin_notes
    ).catch(console.error)
  }

  return NextResponse.json({ returnRequest: returnReq })
}
