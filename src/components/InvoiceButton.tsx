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
  const border = '#000'

  const logoSection = s.showLogo && s.logoUrl
    ? `<img src="${s.logoUrl}" style="height:44px;object-fit:contain" alt="${s.name}" />`
    : `<span style="font-size:26px;letter-spacing:4px;font-weight:900;color:#000;margin:0">${s.name}</span>`

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
      ? `<img src="${item.image}" style="width:44px;height:44px;object-fit:cover;border:1px solid #ccc" alt="" />`
      : `<div style="width:44px;height:44px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999">IMG</div>`

    const variant = [item.color, item.size].filter(Boolean).join(' / ') || '-'
    const stripeBg = i % 2 === 0 ? '#fff' : '#f9f9f9'

    return `
      <tr style="background:${stripeBg}">
        <td style="padding:12px 8px;border-bottom:1px solid #ddd">
          <div style="display:flex;align-items:center;gap:10px">
            ${imgTag}
            <div>
              <div style="font-size:13px;font-weight:600;color:#000;margin:0">${item.title}</div>
              <div style="font-size:10px;color:#888;margin-top:2px;text-transform:uppercase">${item.handle || ''}</div>
            </div>
          </div>
        </td>
        <td style="padding:12px 8px;border-bottom:1px solid #ddd;text-align:center;font-size:12px;color:#333">${variant}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #ddd;text-align:center;font-size:12px;font-weight:600">${item.quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #ddd;text-align:right;font-size:12px;color:#333">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #ddd;text-align:right;font-size:13px;font-weight:600;color:#000">₹${item.total.toLocaleString('en-IN')}</td>
      </tr>`
  }).join('')

  const summaryRows: string[] = []

  summaryRows.push(`
    <tr>
      <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#333">${s.subtotalLabel || 'Subtotal'}</td>
      <td style="padding:6px 0;text-align:right;font-size:12px;color:#333">₹${invoice.subtotal.toLocaleString('en-IN')}</td>
    </tr>`)

  if (invoice.promoCode) {
    summaryRows.push(`
      <tr>
        <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#333">${s.discountLabel || 'Coupon'} (${invoice.promoCode})</td>
        <td style="padding:6px 0;text-align:right;font-size:12px;color:#333">-₹${invoice.discount.toLocaleString('en-IN')}</td>
      </tr>`)
  } else if (invoice.discount > 0) {
    summaryRows.push(`
      <tr>
        <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#333">${s.discountLabel || 'Discount'}</td>
        <td style="padding:6px 0;text-align:right;font-size:12px;color:#333">-₹${invoice.discount.toLocaleString('en-IN')}</td>
      </tr>`)
  }

  summaryRows.push(`
    <tr>
      <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#333">${s.shippingLabel || 'Shipping'}</td>
      <td style="padding:6px 0;text-align:right;font-size:12px;color:#333">${invoice.shippingFee > 0 ? '₹' + invoice.shippingFee.toLocaleString('en-IN') : (s.freeLabel || 'FREE')}</td>
    </tr>`)

  if (s.showGst && invoice.gst) {
    summaryRows.push(`
      <tr>
        <td colspan="4" style="padding:6px 0;text-align:right;font-size:12px;color:#333">${s.gstLabel || 'GST'} (${invoice.gst.percentage}%)</td>
        <td style="padding:6px 0;text-align:right;font-size:12px;color:#333">₹${invoice.gst.amount.toLocaleString('en-IN')}</td>
      </tr>`)
  }

  const couponSection = invoice.promoCode ? `
    <div style="margin-top:10px;border:1px solid #000;padding:8px 12px;display:flex;align-items:center;gap:8px">
      <div>
        <div style="font-size:12px;font-weight:700;color:#000">${s.couponLabel || 'Coupon Applied'}: ${invoice.promoCode}</div>
        <div style="font-size:11px;color:#555">${s.discountLabel || 'You saved'} ₹${invoice.discount.toLocaleString('en-IN')}</div>
      </div>
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
    @media print {
      body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body style="font-family:'Segoe UI',Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#000">

  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid ${border};margin-bottom:24px">
    <div>
      ${logoSection}
      <p style="font-size:11px;color:#666;margin:6px 0 0;line-height:1.5">${s.address}</p>
      <p style="font-size:11px;color:#666;margin:2px 0 0">${s.email} | ${s.phone}</p>
      ${s.gst ? `<p style="font-size:11px;color:#666;margin:2px 0 0">GSTIN: ${s.gst.number}</p>` : ''}
    </div>
    <div style="text-align:right">
      <div style="background:#000;color:#fff;padding:6px 16px;display:inline-block;margin-bottom:8px">
        <span style="font-size:14px;font-weight:700;letter-spacing:1.5px">${s.invoiceLabel || 'TAX INVOICE'}</span>
      </div>
      <p style="font-size:12px;color:#333;margin:4px 0"><strong>${s.invoiceLabel || 'Invoice'} #:</strong> ${invoice.invoiceNumber}</p>
      <p style="font-size:12px;color:#333;margin:2px 0"><strong>${s.orderLabel || 'Order'} #:</strong> ${invoice.orderId.slice(0, 8).toUpperCase()}</p>
      <p style="font-size:11px;color:#666;margin:2px 0">${s.orderDateLabel || 'Order Date'}: ${new Date(invoice.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p style="font-size:11px;color:#666;margin:2px 0">${s.invoiceDateLabel || 'Invoice Date'}: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <!-- CUSTOMER + PAYMENT ROW -->
  <div style="display:flex;justify-content:space-between;margin-bottom:28px;gap:20px">
    <div style="flex:1;background:#f9f9f9;border:1px solid #ddd;padding:16px">
      <p style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#666;margin:0 0 8px;font-weight:700">${s.billToLabel || 'Bill To'}</p>
      <p style="font-size:14px;font-weight:700;margin:0 0 4px">${invoice.customer.name}</p>
      <p style="font-size:12px;color:#333;margin:2px 0">${invoice.customer.address}${invoice.customer.apartment ? ', ' + invoice.customer.apartment : ''}</p>
      <p style="font-size:12px;color:#333;margin:2px 0">${invoice.customer.city}, ${invoice.customer.state} ${invoice.customer.pincode}</p>
      <p style="font-size:12px;color:#333;margin:2px 0">${invoice.customer.email}</p>
      <p style="font-size:12px;color:#333;margin:2px 0">${invoice.customer.phone}</p>
    </div>
    <div style="flex:0.6;background:#f9f9f9;border:1px solid #ddd;padding:16px">
      <p style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#666;margin:0 0 8px;font-weight:700">${s.paymentLabel || 'Payment Details'}</p>
      <p style="font-size:12px;color:#333;margin:4px 0"><strong>${s.paymentMethodLabel || 'Method'}:</strong> ${paymentLabel}</p>
      <p style="font-size:12px;margin:6px 0 0">
        <strong>Status: </strong>
        <span style="display:inline-block;border:1px solid #000;padding:2px 10px;font-size:11px;font-weight:700;letter-spacing:0.5px">${statusText}</span>
      </p>
    </div>
  </div>

  <!-- PRODUCT TABLE -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #000">
    <thead>
      <tr style="background:#000">
        <th style="padding:12px 8px;text-align:left;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">${s.productLabel || 'Product'}</th>
        <th style="padding:12px 8px;text-align:center;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">${s.variantLabel || 'Variant'}</th>
        <th style="padding:12px 8px;text-align:center;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">${s.qtyLabel || 'Qty'}</th>
        <th style="padding:12px 8px;text-align:right;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">${s.rateLabel || 'Rate'}</th>
        <th style="padding:12px 8px;text-align:right;font-size:10px;text-transform:uppercase;color:#fff;letter-spacing:0.5px;font-weight:600">${s.amountLabel || 'Amount'}</th>
      </tr>
    </thead>
    <tbody>
      ${productRows}
    </tbody>
  </table>

  <!-- SUMMARY + QR ROW -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:28px">
    <!-- Price Summary -->
    <div style="flex:1;background:#f9f9f9;border:1px solid #ddd;padding:20px">
      <table style="width:100%;border-collapse:collapse">
        <tbody>
          ${summaryRows.join('')}
        </tbody>
        <tfoot>
          <tr style="border-top:2px solid #000">
            <td colspan="4" style="padding:10px 0;text-align:right;font-size:15px;font-weight:800;color:#000">${s.totalLabel || 'TOTAL'}</td>
            <td style="padding:10px 0;text-align:right;font-size:15px;font-weight:800;color:#000">₹${invoice.total.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
      ${couponSection}
    </div>

    <!-- QR Code -->
    <div style="text-align:center;flex-shrink:0">
      <img src="${qrUrl}" alt="QR Code" style="width:120px;height:120px;border:1px solid #000" />
      <p style="font-size:9px;color:#666;margin:6px 0 0;letter-spacing:0.5px">Scan to view order</p>
    </div>
  </div>

  <!-- RETURN POLICY -->
  <div style="border:1px solid #000;padding:14px 18px;margin-bottom:20px">
    <p style="font-size:11px;font-weight:700;color:#000;margin:0 0 6px">Return Policy</p>
    <p style="font-size:11px;color:#333;margin:0;line-height:1.6">${returnPolicy}</p>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;padding-top:16px;border-top:2px solid #000">
    ${s.terms ? `<p style="font-size:10px;color:#666;margin:0 0 6px">${s.terms}</p>` : ''}
    <p style="font-size:13px;font-weight:800;letter-spacing:1.5px;color:#000;margin:0 0 4px;text-transform:uppercase">${s.footerText || 'NOT MADE TO FIT IN. | BUILT FOR THE REAL ONES. 🔥'}</p>
    <p style="font-size:10px;color:#999;margin:0">${s.name} — ${s.email}</p>
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
