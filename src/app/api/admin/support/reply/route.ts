import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderStatusUpdate } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const admin = createAdminClient()
  const { ticketId, message, status } = await request.json()

  if (!ticketId || !message) {
    return NextResponse.json({ error: 'Ticket ID and message are required' }, { status: 400 })
  }

  // Add admin message
  const { error: msgError } = await admin.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender: 'admin',
    message,
  })

  if (msgError) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  // Update ticket status and admin_reply
  const updates: any = {
    updated_at: new Date().toISOString(),
    admin_reply: message,
  }
  if (status) {
    updates.status = status
  }

  await admin
    .from('support_tickets')
    .update(updates)
    .eq('id', ticketId)

  // Send email notification to user
  const { data: ticket } = await admin
    .from('support_tickets')
    .select('user_email, user_name, subject, id')
    .eq('id', ticketId)
    .single()

  if (ticket?.user_email) {
    try {
      const resend = (await import('resend')).Resend
      if (process.env.RESEND_API_KEY) {
        const resendClient = new resend(process.env.RESEND_API_KEY)
        await resendClient.emails.send({
          from: 'MARVVN Support <support@marvvn.online>',
          to: ticket.user_email,
          subject: `Re: ${ticket.subject} - Ticket #${ticket.id.slice(0, 8).toUpperCase()}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
              <div style="text-align:center;padding:20px 0;border-bottom:2px solid #000">
                <h1 style="font-size:24px;letter-spacing:4px;margin:0">MARVVN</h1>
              </div>
              <div style="padding:20px 0">
                <p style="color:#666">Hi ${ticket.user_name || 'there'},</p>
                <p style="color:#666">We've replied to your support ticket <strong>#${ticket.id.slice(0, 8).toUpperCase()}</strong>:</p>
                <div style="background:#f9f9f9;padding:16px;margin:16px 0;border-left:3px solid #000">
                  <p style="margin:0;color:#333">${message}</p>
                </div>
                <p style="color:#666;font-size:14px">View and reply at: <a href="https://marvvn.online/support/${ticket.id}" style="color:#000">marvvn.online/support/${ticket.id.slice(0, 8)}</a></p>
              </div>
              <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;color:#999;font-size:12px">
                <p>MARVVN Support Team</p>
              </div>
            </body>
            </html>
          `,
        })
      }
    } catch (e) {
      console.error('Failed to send support reply email:', e)
    }
  }

  return NextResponse.json({ success: true })
}
