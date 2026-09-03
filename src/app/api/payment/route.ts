import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { createAdminClient } from '@/lib/supabase/admin'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(request: Request) {
  const { amount, orderId } = await request.json()

  if (!amount || !orderId) {
    return NextResponse.json({ error: 'Amount and orderId are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: dbOrder, error: dbError } = await admin
    .from('orders')
    .select('id, total, user_id')
    .eq('id', orderId)
    .single()

  if (dbError || !dbOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (dbOrder.user_id) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== dbOrder.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
  }

  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: orderId,
      }),
    })

    const order = await response.json()

    if (order.error) {
      return NextResponse.json({ error: order.error.description }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
