import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  if (!signature || !RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const orderId = payment.receipt // Our order ID

    if (orderId) {
      const admin = createAdminClient()

      // Update order payment status
      const { error } = await admin
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_id: payment.id,
          status: 'confirmed',
        })
        .eq('id', orderId)
        .eq('payment_status', 'pending')

      if (error) {
        console.error('Webhook: Failed to update order:', error)
      }
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity
    const orderId = payment.receipt

    if (orderId) {
      const admin = createAdminClient()
      await admin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', orderId)
    }
  }

  return NextResponse.json({ received: true })
}
