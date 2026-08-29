import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderStatusUpdate } from '@/lib/email'
import { sendWhatsAppOrderStatusUpdate } from '@/lib/whatsapp'

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

  const { data, error } = await supabase
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

  const body = await request.json()
  const { status, payment_status } = body

  const updateData: any = { updated_at: new Date().toISOString() }
  if (status) updateData.status = status
  if (payment_status) updateData.payment_status = payment_status

  // Get current order to append to status_history
  const { data: currentOrder } = await supabase
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

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (status && data) {
    const { data: profile } = await supabase.from('profiles').select('email, name').eq('id', data.user_id).single()
    if (profile?.email) {
      sendOrderStatusUpdate(id, profile.email, status).catch(console.error)
    }
    const phone = data.shipping_address?.phone
    if (phone) {
      sendWhatsAppOrderStatusUpdate(phone, id, status).catch(console.error)
    }
  }

  return NextResponse.json({ order: data })
}
