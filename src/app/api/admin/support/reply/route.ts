import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }

  const { ticketId, message, status } = await request.json()

  if (!ticketId || !message) {
    return NextResponse.json({ error: 'Ticket ID and message are required' }, { status: 400 })
  }

  const msgRes = await fetch(`${supabaseUrl}/rest/v1/ticket_messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ticket_id: ticketId,
      sender: 'admin',
      message,
    }),
  })

  if (!msgRes.ok) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  const updates: any = {
    updated_at: new Date().toISOString(),
    admin_reply: message,
  }
  if (status) {
    updates.status = status
  }

  await fetch(`${supabaseUrl}/rest/v1/support_tickets?id=eq.${ticketId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  })

  // Send email notification
  const ticketRes = await fetch(`${supabaseUrl}/rest/v1/support_tickets?id=eq.${ticketId}&select=user_email,user_name,subject,id`, { headers })
  const tickets = await ticketRes.json()
  const ticket = tickets?.[0]

  if (ticket?.user_email && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resendClient = new Resend(process.env.RESEND_API_KEY)
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
              <p style="color:#666;font-size:14px">View and reply at: <a href="https://marvvn.online/support/${ticket.id}" style="color:#000">marvvn.online/support</a></p>
            </div>
            <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;color:#999;font-size:12px">
              <p>MARVVN Support Team</p>
            </div>
          </body>
          </html>
        `,
      })
    } catch (e) {
      console.error('Failed to send support reply email:', e)
    }
  }

  return NextResponse.json({ success: true })
}
