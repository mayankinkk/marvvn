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
    footerText?: string
    terms?: string
    returnPolicy?: string
    couponLabel?: string
    subtotalLabel?: string
    discountLabel?: string
    shippingLabel?: string
    gstLabel?: string
    totalLabel?: string
    paidLabel?: string
    pendingLabel?: string
    failedLabel?: string
    paymentMethodLabel?: string
    codLabel?: string
    onlineLabel?: string
    billToLabel?: string
    paymentLabel?: string
    invoiceLabel?: string
    orderLabel?: string
    orderDateLabel?: string
    invoiceDateLabel?: string
    productLabel?: string
    variantLabel?: string
    qtyLabel?: string
    rateLabel?: string
    amountLabel?: string
    freeLabel?: string
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

  const logoSection = s.showLogo && s.logoUrl
    ? `<img src="${s.logoUrl}" style="height:40px;object-fit:contain" alt="${s.name}" />`
    : `<div style="font-size:28px;font-weight:900;letter-spacing:3px;color:#000">${s.name}</div>`

  const paymentLabel = invoice.paymentMethod === 'cod'
    ? (s.codLabel || 'Cash on Delivery')
    : (s.onlineLabel || 'Online Payment')
  const statusText = invoice.paymentStatus === 'paid'
    ? (s.paidLabel || 'PAID')
    : invoice.paymentStatus === 'failed'
      ? (s.failedLabel || 'FAILED')
      : (s.pendingLabel || 'PENDING')

  const productRows = invoice.items.map((item, i) => {
    const imgTag = item.image
      ? `<img src="${item.image}" style="width:40px;height:40px;object-fit:cover;border:1px solid #ddd" alt="" />`
      : `<div style="width:40px;height:40px;border:1px solid #ddd;background:#f5f5f5"></div>`

    const variant = [item.color, item.size].filter(Boolean).join(' / ') || '-'

    return `
      <tr style="border-bottom:1px solid #e5e5e5">
        <td style="padding:10px 0">
          <div style="display:flex;align-items:center;gap:10px">
            ${imgTag}
            <div>
              <div style="font-size:13px;font-weight:600;color:#000">${item.title}</div>
              <div style="font-size:10px;color:#888;margin-top:1px;text-transform:uppercase">${item.handle}</div>
            </div>
          </div>
        </td>
        <td style="padding:10px 0;text-align:center;font-size:12px;color:#444">${variant}</td>
        <td style="padding:10px 0;text-align:center;font-size:12px;font-weight:600">${item.quantity}</td>
        <td style="padding:10px 0;text-align:right;font-size:12px;color:#444">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding:10px 0;text-align:right;font-size:13px;font-weight:600">₹${item.total.toLocaleString('en-IN')}</td>
      </tr>`
  }).join('')

  const summaryRows: string[] = []
  summaryRows.push(`<tr><td style="padding:5px 0;font-size:12px;color:#444">${s.subtotalLabel || 'Subtotal'}</td><td style="padding:5px 0;text-align:right;font-size:12px;color:#444;width:100px">₹${invoice.subtotal.toLocaleString('en-IN')}</td></tr>`)

  if (invoice.promoCode) {
    summaryRows.push(`<tr><td style="padding:5px 0;font-size:12px;color:#444">${s.discountLabel || 'Discount'} (${invoice.promoCode})</td><td style="padding:5px 0;text-align:right;font-size:12px;color:#444">-₹${invoice.discount.toLocaleString('en-IN')}</td></tr>`)
  } else if (invoice.discount > 0) {
    summaryRows.push(`<tr><td style="padding:5px 0;font-size:12px;color:#444">${s.discountLabel || 'Discount'}</td><td style="padding:5px 0;text-align:right;font-size:12px;color:#444">-₹${invoice.discount.toLocaleString('en-IN')}</td></tr>`)
  }

  summaryRows.push(`<tr><td style="padding:5px 0;font-size:12px;color:#444">${s.shippingLabel || 'Shipping'}</td><td style="padding:5px 0;text-align:right;font-size:12px;color:#444">${invoice.shippingFee > 0 ? '₹' + invoice.shippingFee.toLocaleString('en-IN') : (s.freeLabel || 'FREE')}</td></tr>`)

  if (s.showGst && invoice.gst) {
    summaryRows.push(`<tr><td style="padding:5px 0;font-size:12px;color:#444">${s.gstLabel || 'GST'} (${invoice.gst.percentage}%)</td><td style="padding:5px 0;text-align:right;font-size:12px;color:#444">₹${invoice.gst.amount.toLocaleString('en-IN')}</td></tr>`)
  }

  const couponSection = invoice.promoCode ? `
    <div style="margin-top:12px;border:1px solid #000;padding:10px 14px">
      <div style="font-size:12px;font-weight:700;color:#000">${s.couponLabel || 'Coupon Applied'}: ${invoice.promoCode}</div>
      <div style="font-size:11px;color:#555;margin-top:2px">${s.discountLabel || 'You saved'} ₹${invoice.discount.toLocaleString('en-IN')}</div>
    </div>` : ''

  const returnPolicy = s.returnPolicy || 'Return accepted within 3 days of delivery • Product must be unused & undamaged • Delivery charges are non-refundable • Damaged/used products are not accepted • Refund after quality inspection'

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${invoice.siteUrl}/account/orders`)}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @media print { body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { margin: 12mm; } }
    * { box-sizing: border-box; }
  </style>
</head>
<body style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;padding:0;margin:0;color:#000;background:#fff">
  <div style="max-width:750px;margin:0 auto;padding:40px 36px">

    <!-- HEADER -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="vertical-align:top;padding-bottom:20px;border-bottom:2px solid #000">
          ${logoSection}
          <div style="font-size:11px;color:#555;margin-top:6px;line-height:1.6">
            ${s.address}<br/>
            ${s.email} | ${s.phone}
            ${s.gst ? `<br/>GSTIN: ${s.gst.number}` : ''}
          </div>
        </td>
        <td style="vertical-align:top;text-align:right;padding-bottom:20px;border-bottom:2px solid #000">
          <div style="font-size:20px;font-weight:800;letter-spacing:2px;color:#000;margin-bottom:6px">${s.invoiceLabel || 'TAX INVOICE'}</div>
          <table style="margin-left:auto;border-collapse:collapse">
            <tr>
              <td style="font-size:11px;color:#666;padding:2px 10px 2px 0;text-align:right;white-space:nowrap">${s.invoiceLabel || 'Invoice'} #</td>
              <td style="font-size:12px;font-weight:600;padding:2px 0;text-align:right">${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="font-size:11px;color:#666;padding:2px 10px 2px 0;text-align:right">${s.orderLabel || 'Order'} #</td>
              <td style="font-size:12px;font-weight:600;padding:2px 0;text-align:right">${invoice.orderId.slice(0, 8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="font-size:11px;color:#666;padding:2px 10px 2px 0;text-align:right">${s.orderDateLabel || 'Order Date'}</td>
              <td style="font-size:11px;padding:2px 0;text-align:right">${new Date(invoice.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="font-size:11px;color:#666;padding:2px 10px 2px 0;text-align:right">${s.invoiceDateLabel || 'Invoice Date'}</td>
              <td style="font-size:11px;padding:2px 0;text-align:right">${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- BILL TO + PAYMENT -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="vertical-align:top;width:60%;padding-right:20px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:6px">${s.billToLabel || 'Bill To'}</div>
          <div style="font-size:14px;font-weight:700;margin-bottom:3px">${invoice.customer.name}</div>
          <div style="font-size:12px;color:#333;line-height:1.6">
            ${invoice.customer.address}${invoice.customer.apartment ? ', ' + invoice.customer.apartment : ''}<br/>
            ${invoice.customer.city}, ${invoice.customer.state} ${invoice.customer.pincode}<br/>
            ${invoice.customer.email}<br/>
            ${invoice.customer.phone}
          </div>
        </td>
        <td style="vertical-align:top;width:40%">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:6px">${s.paymentLabel || 'Payment Details'}</div>
          <table style="border-collapse:collapse">
            <tr>
              <td style="font-size:11px;color:#666;padding:3px 10px 3px 0">${s.paymentMethodLabel || 'Method'}</td>
              <td style="font-size:12px;font-weight:600;padding:3px 0">${paymentLabel}</td>
            </tr>
            <tr>
              <td style="font-size:11px;color:#666;padding:3px 10px 3px 0">Status</td>
              <td style="padding:3px 0"><span style="font-size:11px;font-weight:700;border:1px solid #000;padding:2px 8px;letter-spacing:0.5px">${statusText}</span></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- PRODUCT TABLE -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#000;color:#fff">
          <th style="padding:10px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${s.productLabel || 'Product'}</th>
          <th style="padding:10px 8px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${s.variantLabel || 'Variant'}</th>
          <th style="padding:10px 8px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${s.qtyLabel || 'Qty'}</th>
          <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${s.rateLabel || 'Rate'}</th>
          <th style="padding:10px 8px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${s.amountLabel || 'Amount'}</th>
        </tr>
      </thead>
      <tbody>
        ${productRows}
      </tbody>
    </table>

    <!-- TOTALS -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr>
        <td style="width:55%"></td>
        <td style="width:45%">
          <table style="width:100%;border-collapse:collapse">
            ${summaryRows.join('')}
            <tr style="border-top:2px solid #000">
              <td style="padding:10px 0;font-size:14px;font-weight:800">${s.totalLabel || 'TOTAL'}</td>
              <td style="padding:10px 0;text-align:right;font-size:14px;font-weight:800">₹${invoice.total.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${couponSection}

    <!-- QR CODE + RETURN POLICY -->
    <table style="width:100%;border-collapse:collapse;margin-top:${invoice.promoCode ? '16px' : '0'};margin-bottom:20px">
      <tr>
        <td style="vertical-align:top;width:65%;padding-right:20px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:6px">Return Policy</div>
          <div style="font-size:11px;color:#333;line-height:1.7;border-left:2px solid #000;padding-left:12px">${returnPolicy}</div>
        </td>
        <td style="vertical-align:top;width:35%;text-align:right">
          <img src="${qrUrl}" alt="QR" style="width:100px;height:100px;border:1px solid #ddd" />
          <div style="font-size:9px;color:#888;margin-top:4px;letter-spacing:0.3px">Scan to view order online</div>
        </td>
      </tr>
    </table>

    <!-- FOOTER -->
    <div style="border-top:2px solid #000;padding-top:16px;text-align:center">
      ${s.terms ? `<div style="font-size:10px;color:#888;margin-bottom:6px">${s.terms}</div>` : ''}
      <div style="font-size:12px;font-weight:800;letter-spacing:1.5px;color:#000;text-transform:uppercase;margin-bottom:4px">${s.footerText || 'NOT MADE TO FIT IN. | BUILT FOR THE REAL ONES.'}</div>
      <div style="font-size:10px;color:#aaa">${s.name} &mdash; ${s.email}</div>
    </div>

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
