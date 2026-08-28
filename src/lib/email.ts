import { Resend } from 'resend'

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  items: { title: string; quantity: number; price: number; size?: string; color?: string }[]
  total: number
  shippingAddress: {
    firstName?: string
    lastName?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
  }
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const client = getResend()
  if (!client) return

  const itemsHtml = data.items.map(item =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.title}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${item.price.toLocaleString()}</td>
    </tr>`
  ).join('')

  await client.emails.send({
    from: 'MARVVN <orders@marvvn.online>',
    to: data.customerEmail,
    subject: `Order Confirmed #${data.orderId.slice(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;padding:20px 0;border-bottom:2px solid #000">
          <h1 style="font-size:24px;letter-spacing:4px;margin:0">MARVVN</h1>
        </div>
        <div style="padding:20px 0">
          <h2 style="color:#333">Order Confirmed!</h2>
          <p style="color:#666">Hi ${data.customerName},</p>
          <p style="color:#666">Your order <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong> has been confirmed.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;text-align:right;font-weight:bold">Total</td>
              <td style="padding:8px;text-align:right;font-weight:bold">₹${data.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div style="background:#f9f9f9;padding:16px;margin:20px 0">
          <h3 style="margin:0 0 8px;font-size:14px">Shipping Address</h3>
          <p style="margin:0;color:#666;font-size:14px">
            ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br/>
            ${data.shippingAddress.address}<br/>
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}
          </p>
        </div>
        <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;color:#999;font-size:12px">
          <p>Thank you for shopping with MARVVN!</p>
          <p>marvvn.online</p>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendOrderStatusUpdate(orderId: string, email: string, status: string) {
  const client = getResend()
  if (!client) return

  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    shipped: 'Your order has been shipped! Track your package.',
    delivered: 'Your order has been delivered. We hope you love it!',
    cancelled: 'Your order has been cancelled.',
  }

  await client.emails.send({
    from: 'MARVVN <orders@marvvn.online>',
    to: email,
    subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} #${orderId.slice(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;padding:20px 0;border-bottom:2px solid #000">
          <h1 style="font-size:24px;letter-spacing:4px;margin:0">MARVVN</h1>
        </div>
        <div style="padding:20px 0;text-align:center">
          <h2 style="color:#333">Order ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
          <p style="color:#666">${statusMessages[status] || 'Your order status has been updated.'}</p>
          <p style="color:#999;font-size:14px">Order #${orderId.slice(0, 8).toUpperCase()}</p>
        </div>
        <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;color:#999;font-size:12px">
          <p>Thank you for shopping with MARVVN!</p>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendCartAbandonmentEmail(email: string, items: { title: string; quantity: number; price: number; handle: string }[], total: number) {
  const client = getResend()
  if (!client) return

  const itemsHtml = items.map(item =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">
        <a href="https://marvvn.online/products/${item.handle}" style="color:#000;text-decoration:none">${item.title}</a>
      </td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${item.price.toLocaleString()}</td>
    </tr>`
  ).join('')

  await client.emails.send({
    from: 'MARVVN <hello@marvvn.online>',
    to: email,
    subject: 'You left something behind!',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;padding:20px 0;border-bottom:2px solid #000">
          <h1 style="font-size:24px;letter-spacing:4px;margin:0">MARVVN</h1>
        </div>
        <div style="padding:20px 0;text-align:center">
          <h2 style="color:#333">Still thinking it over?</h2>
          <p style="color:#666">You left some great items in your cart. They are selling fast — grab them before they are gone!</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;text-align:right;font-weight:bold">Total</td>
              <td style="padding:8px;text-align:right;font-weight:bold">₹${total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div style="text-align:center;padding:20px 0">
          <a href="https://marvvn.online/cart" style="display:inline-block;padding:14px 32px;background:#000;color:#fff;text-decoration:none;font-weight:bold">Complete Your Order</a>
        </div>
        <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;color:#999;font-size:12px">
          <p>Need help? Reply to this email or WhatsApp us.</p>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string) {
  const client = getResend()
  if (!client) return

  await client.emails.send({
    from: 'MARVVN <hello@marvvn.online>',
    to: email,
    subject: 'Welcome to MARVVN!',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;padding:20px 0;border-bottom:2px solid #000">
          <h1 style="font-size:24px;letter-spacing:4px;margin:0">MARVVN</h1>
        </div>
        <div style="padding:20px 0;text-align:center">
          <h2 style="color:#333">Welcome to the club, ${name}!</h2>
          <p style="color:#666">You're now part of the MARVVN family. Get ready for exclusive drops, sales, and style updates.</p>
          <a href="https://marvvn.online/collections/new-arrivals" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;margin-top:16px">Shop New Arrivals</a>
        </div>
        <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;color:#999;font-size:12px">
          <p>#Devilsinthedetails</p>
        </div>
      </body>
      </html>
    `,
  })
}
