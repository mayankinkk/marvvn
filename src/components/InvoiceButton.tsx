'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'

interface InvoiceData {
  orderId: string
  orderDate: string
  invoiceDate: string
  invoiceNumber: string
  siteUrl: string
  store: {
    name: string
    email: string
    phone: string
    address: string
    logoUrl?: string
    showLogo?: boolean
    gst?: { number: string; percentage: number } | null
    showGst?: boolean
    primaryColor?: string
    secondaryColor?: string
    footerText?: string
    terms?: string
  }
  customer: {
    name: string
    email: string
    phone: string
    address: string
    apartment: string
    city: string
    state: string
    pincode: string
  }
  items: { title: string; handle: string; image: string; quantity: number; size: string; color: string; price: number; total: number }[]
  subtotal: number
  gst?: { percentage: number; amount: number } | null
  discount: number
  shippingFee: number
  promoCode: string | null
  total: number
  paymentMethod: string
  paymentStatus: string
}

function generateInvoiceHTML(invoice: InvoiceData): string {
  const s = invoice.store
  const pc = s.primaryColor || '#000000'
  const sc = s.secondaryColor || '#666666'

  const logoSection = s.showLogo && s.logoUrl
    ? `<img src="${s.logoUrl}" style="height:44px;object-fit:contain" alt="${s.name}" />`
    : `<span style="font-size:26px;letter-spacing:4px;font-weight:900;color:${pc};margin:0">${s.name}</span>`

  const paymentLabel = invoice.paymentMethod === 'cod' ? 'Cash on Delivery' : invoice.paymentMethod === 'upi' ? 'UPI Payment' : invoice.paymentMethod === 'card' ? 'Card Payment' : invoice.paymentMethod === 'netbanking' ? 'Net Banking' : invoice.paymentMethod || 'Online'
  const paymentStatusColor = invoice.paymentStatus === 'paid' ? '#16a34a' : invoice.paymentStatus === 'failed' ? '#dc2626' : '#d97706'
  const paymentStatusText = invoice.paymentStatus === 'paid' ? 'PAID' : invoice.paymentStatus === 'failed' ? 'FAILED' : 'PENDING'

  const productRows = invoice.items.map((item, i) => {
    const imgTag = item.image
      ? `<img src="${item.image}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #eee" alt="" />`
      : `<div style="width:44px;height:44px;border-radius:6px;background:#f5f5f5;border:1px solid #eee;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999">IMG</div>`

    const variant = [item.color, item.size].filter(Boolean).join(' / ') || '-'
    const stripeBg = i % 2 === 0 ? '#fff' : '#fafafa'

    return `
      <tr style="background:${stripeBg}">
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0">
          <div style="display:flex;align-items:center;gap:10px">
            ${imgTag}
            <div>
              <div style="font-size:13px;font-weight:600;color:#1a1a1a;margin:0">${item.title}</div>
              <div style="font-size:10px;color:#999;margin-top:2px;text-transform:uppercase">${item.handle || ''}</div>
            </div>
          </div>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#555">${variant}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;font-weight:600">${item.quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#555">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;font-weight:600;color:#1a1a1a">₹${item.total.toLocaleString('en-IN')}</td>
      </tr>`
  }).join('')

  const summaryRows: string[] = []

  summaryRows.push(`
    <tr>
      <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#555">Subtotal</td>
      <td style="padding:6px 0;text-align:right;font-size:12px;color:#555">₹${invoice.subtotal.toLocaleString('en-IN')}</td>
    </tr>`)

  if (invoice.promoCode) {
    summaryRows.push(`
      <tr>
        <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#16a34a">Coupon (${invoice.promoCode})</td>
        <td style="padding:6px 0;text-align:right;font-size:12px;color:#16a34a">-₹${invoice.discount.toLocaleString('en-IN')}</td>
      </tr>`)
  } else if (invoice.discount > 0) {
    summaryRows.push(`
      <tr>
        <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#16a34a">Discount</td>
        <td style="padding:6px 0;text-align:right;font-size:12px;color:#16a34a">-₹${invoice.discount.toLocaleString('en-IN')}</td>
      </tr>`)
  }

  summaryRows.push(`
    <tr>
      <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#555">Shipping</td>
      <td style="padding:6px 0;text-align:right;font-size:12px;color:${invoice.shippingFee > 0 ? '#555' : '#16a34a'}">${invoice.shippingFee > 0 ? '₹' + invoice.shippingFee.toLocaleString('en-IN') : 'FREE'}</td>
    </tr>`)

  if (s.showGst && invoice.gst) {
    summaryRows.push(`
      <tr>
        <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#555">GST (${invoice.gst.percentage}%)</td>
        <td style="padding:6px 0;text-align:right;font-size:12px;color:#555">₹${invoice.gst.amount.toLocaleString('en-IN')}</td>
      </tr>`)
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${invoice.siteUrl}/account/orders`)}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @media print {
      body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#1a1a1a">

  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid ${pc};margin-bottom:24px">
    <div>
      ${logoSection}
      <p style="font-size:11px;color:#888;margin:6px 0 0;line-height:1.5">${s.address}</p>
      <p style="font-size:11px;color:#888;margin:2px 0 0">${s.email} | ${s.phone}</p>
      ${s.gst ? `<p style="font-size:11px;color:#888;margin:2px 0 0">GSTIN: ${s.gst.number}</p>` : ''}
    </div>
    <div style="text-align:right">
      <div style="background:${pc};color:#fff;padding:6px 16px;border-radius:4px;display:inline-block;margin-bottom:8px">
        <span style="font-size:14px;font-weight:700;letter-spacing:1.5px">TAX INVOICE</span>
      </div>
      <p style="font-size:12px;color:#555;margin:4px 0"><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
      <p style="font-size:12px;color:#555;margin:2px 0"><strong>Order #:</strong> ${invoice.orderId.slice(0, 8).toUpperCase()}</p>
      <p style="font-size:11px;color:#888;margin:2px 0">Order Date: ${new Date(invoice.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p style="font-size:11px;color:#888;margin:2px 0">Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <!-- CUSTOMER + PAYMENT ROW -->
  <div style="display:flex;justify-content:space-between;margin-bottom:28px;gap:20px">
    <div style="flex:1;background:#fafafa;border-radius:8px;padding:16px">
      <p style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${sc};margin:0 0 8px;font-weight:700">Bill To</p>
      <p style="font-size:14px;font-weight:700;margin:0 0 4px">${invoice.customer.name}</p>
      <p style="font-size:12px;color:#555;margin:2px 0">${invoice.customer.address}${invoice.customer.apartment ? ', ' + invoice.customer.apartment : ''}</p>
      <p style="font-size:12px;color:#555;margin:2px 0">${invoice.customer.city}, ${invoice.customer.state} ${invoice.customer.pincode}</p>
      <p style="font-size:12px;color:#555;margin:2px 0">${invoice.customer.email}</p>
      <p style="font-size:12px;color:#555;margin:2px 0">${invoice.customer.phone}</p>
    </div>
    <div style="flex:0.6;background:#fafafa;border-radius:8px;padding:16px">
      <p style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${sc};margin:0 0 8px;font-weight:700">Payment Details</p>
      <p style="font-size:12px;color:#555;margin:4px 0"><strong>Method:</strong> ${paymentLabel}</p>
      <p style="font-size:12px;margin:6px 0 0">
        <strong>Status: </strong>
        <span style="display:inline-block;background:${paymentStatusColor}15;color:${paymentStatusColor};padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:0.5px">${paymentStatusText}</span>
      </p>
    </div>
  </div>

  <!-- PRODUCT TABLE -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:8px;overflow:hidden;border:1px solid #eee">
    <thead>
      <tr style="background:${pc}">
        <th style="padding:12px 8px;text-align:left;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">Product</th>
        <th style="padding:12px 8px;text-align:center;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">Variant</th>
        <th style="padding:12px 8px;text-align:center;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">Qty</th>
        <th style="padding:12px 8px;text-align:right;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">Rate</th>
        <th style="padding:12px 8px;text-align:right;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${productRows}
    </tbody>
  </table>

  <!-- SUMMARY + QR ROW -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:28px">
    <!-- Price Summary -->
    <div style="flex:1;background:#fafafa;border-radius:8px;padding:20px">
      <table style="width:100%;border-collapse:collapse">
        <tbody>
          ${summaryRows.join('')}
        </tbody>
        <tfoot>
          <tr style="border-top:2px solid ${pc}">
            <td colspan="4" style="padding:10px 0;text-align:right;font-size:15px;font-weight:800;color:#1a1a1a">TOTAL</td>
            <td style="padding:10px 0;text-align:right;font-size:15px;font-weight:800;color:${pc}">₹${invoice.total.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
      ${invoice.promoCode ? `
      <div style="margin-top:10px;background:#16a34a10;border:1px solid #16a34a30;border-radius:6px;padding:8px 12px;display:flex;align-items:center;gap:8px">
        <span style="font-size:16px">🎟️</span>
        <div>
          <div style="font-size:12px;font-weight:700;color:#16a34a">Coupon Applied: ${invoice.promoCode}</div>
          <div style="font-size:11px;color:#555">You saved ₹${invoice.discount.toLocaleString('en-IN')}</div>
        </div>
      </div>` : ''}
    </div>

    <!-- QR Code -->
    <div style="text-align:center;flex-shrink:0">
      <img src="${qrUrl}" alt="QR Code" style="width:120px;height:120px;border-radius:8px;border:1px solid #eee" />
      <p style="font-size:9px;color:#888;margin:6px 0 0;letter-spacing:0.5px">Scan to view order</p>
    </div>
  </div>

  <!-- RETURN POLICY -->
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:20px">
    <p style="font-size:11px;font-weight:700;color:#92400e;margin:0 0 6px">Return Policy</p>
    <ul style="margin:0;padding-left:18px;font-size:11px;color:#78350f;line-height:1.8">
      <li>Return accepted within <strong>3 days</strong> of delivery</li>
      <li>Product must be <strong>unused &amp; undamaged</strong></li>
      <li>Delivery charges are <strong>non-refundable</strong></li>
      <li>Damaged/used products are <strong>not accepted</strong></li>
      <li>Refund processed after <strong>quality inspection</strong></li>
    </ul>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding-top:16px;border-top:1px solid #eee">
    ${s.terms ? `<p style="font-size:10px;color:#999;margin:0 0 6px">${s.terms}</p>` : ''}
    <p style="font-size:13px;font-weight:800;letter-spacing:1.5px;color:${pc};margin:0 0 4px;text-transform:uppercase">${s.footerText}</p>
    <p style="font-size:10px;color:#bbb;margin:0">${s.name} — ${s.email}</p>
  </div>

</body>
</html>`
}

interface InvoiceButtonProps {
  orderId: string
  className?: string
}

export default function InvoiceButton({ orderId, className = '' }: InvoiceButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoice?orderId=${orderId}`)
      const data = await res.json()

      if (data.invoice) {
        const html = generateInvoiceHTML(data.invoice)
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${data.invoice.invoiceNumber || 'MARVVN-Invoice'}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      console.error('Invoice generation failed:', e)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs font-medium text-marvvn-gray-500 hover:text-marvvn-black transition-colors cursor-pointer disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <div className="animate-spin w-3 h-3 border border-marvvn-gray-400 border-t-transparent rounded-full" />
      ) : (
        <FileText className="w-3.5 h-3.5" />
      )}
      Invoice
    </button>
  )
}
