import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderStatusUpdate } from '@/lib/email'
import { sendWhatsAppOrderStatusUpdate } from '@/lib/whatsapp'
import { scheduleWinBack } from '@/lib/scheduled-emails'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('orders')
    .select('*, order_items(*, products(title, handle, images))')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ order: data })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()

  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const body = await request.json()
  const { status, payment_status, notes, tracking_number } = body

  const updateData: any = { updated_at: new Date().toISOString() }
  if (status) updateData.status = status
  if (payment_status) updateData.payment_status = payment_status
  if (notes !== undefined) updateData.notes = notes
  if (tracking_number !== undefined) updateData.tracking_number = tracking_number

  const { data: currentOrder } = await admin
    .from('orders')
    .select('status_history')
    .eq('id', id)
    .single()

  if (status) {
    const history = currentOrder?.status_history || []
    updateData.status_history = [
      ...history,
      { status, timestamp: new Date().toISOString() }
    ]
  }

  const { data, error } = await admin
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select('*, order_items(*, products(title, handle, images))')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (status && data) {
    const { data: profile } = await admin.from('profiles').select('email, name').eq('id', data.user_id).single()
    if (profile?.email) {
      sendOrderStatusUpdate(id, profile.email, status, tracking_number).catch(console.error)
    }
    const phone = data.shipping_address?.phone
    if (phone) {
      sendWhatsAppOrderStatusUpdate(phone, id, status).catch(console.error)
    }

    // Schedule win-back email when order is delivered (30 days later)
    if (status === 'delivered' && profile?.email) {
      scheduleWinBack(
        id,
        data.user_id,
        profile.email,
        profile.name || 'there',
        30
      ).catch(console.error)
    }
  }

  return NextResponse.json({ order: data })
}
