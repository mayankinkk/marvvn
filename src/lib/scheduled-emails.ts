import { createAdminClient } from '@/lib/supabase/admin'

interface ScheduleEmailParams {
  orderId: string
  userId?: string
  email: string
  emailType: 'review_request' | 'win_back' | 'post_delivery_followup'
  subject: string
  html: string
  scheduledFor: Date
}

export async function scheduleEmail(params: ScheduleEmailParams): Promise<boolean> {
  const admin = createAdminClient()

  const { error } = await admin.from('scheduled_emails').insert({
    order_id: params.orderId,
    user_id: params.userId || null,
    email: params.email,
    email_type: params.emailType,
    subject: params.subject,
    html: params.html,
    scheduled_for: params.scheduledFor.toISOString(),
  })

  return !error
}

export async function scheduleReviewRequest(
  orderId: string,
  userId: string | undefined,
  email: string,
  customerName: string,
  items: { title: string; handle: string }[],
  daysAfterDelivery: number = 7
): Promise<boolean> {
  // Schedule for 7 days from now (assumes delivery happened around order time for simplicity)
  // In production, you'd trigger this from the "delivered" status update instead
  const scheduledFor = new Date()
  scheduledFor.setDate(scheduledFor.getDate() + daysAfterDelivery)

  const productLinks = items.map(item =>
    `<tr>
      <td style="padding:12px;border-bottom:1px solid #eee">
        <a href="https://marvvn.online/products/${item.handle}" style="color:#000;text-decoration:none;font-weight:bold">${item.title}</a>
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right">
        <a href="https://marvvn.online/products/${item.handle}#reviews" style="display:inline-block;padding:8px 16px;background:#000;color:#fff;text-decoration:none;font-size:12px">Write Review</a>
      </td>
    </tr>`
  ).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="text-align:center;padding:20px 0;border-bottom:2px solid #000">
        <h1 style="font-size:24px;letter-spacing:4px;margin:0">MARVVN</h1>
      </div>
      <div style="padding:20px 0;text-align:center">
        <h2 style="color:#333">Love your new fit?</h2>
        <p style="color:#666">Hi ${customerName},</p>
        <p style="color:#666">Your order #${orderId.slice(0, 8).toUpperCase()} has been delivered. We'd love to hear what you think!</p>
        <p style="color:#666">Your review helps other customers make better choices and helps us improve.</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tbody>${productLinks}</tbody>
      </table>
      <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;color:#999;font-size:12px">
        <p>Thank you for shopping with MARVVN!</p>
        <p>#Devilsinthedetails</p>
      </div>
    </body>
    </html>
  `

  return scheduleEmail({
    orderId,
    userId,
    email,
    emailType: 'review_request',
    subject: 'How was your order? Leave a review!',
    html,
    scheduledFor,
  })
}

export async function scheduleWinBack(
  orderId: string,
  userId: string | undefined,
  email: string,
  customerName: string,
  daysAfterLastOrder: number = 30
): Promise<boolean> {
  const scheduledFor = new Date()
  scheduledFor.setDate(scheduledFor.getDate() + daysAfterLastOrder)

  // Generate a unique discount code
  const discountCode = `COMEBACK${Date.now().toString(36).toUpperCase()}`

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="text-align:center;padding:20px 0;border-bottom:2px solid #000">
        <h1 style="font-size:24px;letter-spacing:4px;margin:0">MARVVN</h1>
      </div>
      <div style="padding:30px 0;text-align:center">
        <h2 style="color:#333;font-size:20px">We miss you, ${customerName}!</h2>
        <p style="color:#666;margin:16px 0">It's been a while since your last order. We've got fresh drops and new styles waiting for you.</p>
        <div style="background:#f5f5f5;padding:20px;margin:20px 0;display:inline-block">
          <p style="color:#999;font-size:12px;margin:0 0 8px">YOUR EXCLUSIVE CODE</p>
          <p style="color:#000;font-size:24px;font-weight:bold;letter-spacing:4px;margin:0">${discountCode}</p>
          <p style="color:#666;font-size:13px;margin:8px 0 0">10% off your next order</p>
        </div>
        <div style="margin-top:24px">
          <a href="https://marvvn.online/collections/new-arrivals" style="display:inline-block;padding:14px 32px;background:#000;color:#fff;text-decoration:none;font-weight:bold">Shop New Arrivals</a>
        </div>
      </div>
      <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;color:#999;font-size:12px">
        <p>This code expires in 7 days. Don't miss out!</p>
        <p>#Devilsinthedetails</p>
      </div>
    </body>
    </html>
  `

  // Also create the coupon in the coupons table
  const admin = createAdminClient()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await admin.from('coupons').insert({
    code: discountCode,
    discount_type: 'percentage',
    discount_value: 10,
    min_cart: 499,
    max_uses: 1,
    expires_at: expiresAt.toISOString(),
    is_active: true,
  })

  return scheduleEmail({
    orderId,
    userId,
    email,
    emailType: 'win_back',
    subject: `Hey ${customerName}, we miss you! Here's 10% off`,
    html,
    scheduledFor,
  })
}

export async function processScheduledEmails(): Promise<{ sent: number; failed: number }> {
  const admin = createAdminClient()
  const { Resend } = await import('resend')

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { sent: 0, failed: 0 }

  const resend = new Resend(resendKey)

  // Fetch emails that are due and not yet sent
  const { data: emails, error } = await admin
    .from('scheduled_emails')
    .select('*')
    .eq('sent', false)
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(50)

  if (error || !emails || emails.length === 0) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (const email of emails) {
    try {
      await resend.emails.send({
        from: 'MARVVN <hello@marvvn.online>',
        to: email.email,
        subject: email.subject,
        html: email.html,
      })

      await admin
        .from('scheduled_emails')
        .update({ sent: true, sent_at: new Date().toISOString() })
        .eq('id', email.id)

      sent++
    } catch (err: any) {
      await admin
        .from('scheduled_emails')
        .update({ error: err.message || 'Unknown error' })
        .eq('id', email.id)

      failed++
    }
  }

  return { sent, failed }
}
