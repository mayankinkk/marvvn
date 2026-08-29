'use client'

import { useState } from 'react'
import { Download, FileText } from 'lucide-react'

interface InvoiceItem {
  title: string
  quantity: number
  size?: string
  color?: string
  price: number
  total: number
}

interface InvoiceData {
  orderId: string
  orderDate: string
  invoiceNumber: string
  store: {
    name: string
    email: string
    phone: string
    address: string
    gst?: { number: string; percentage: number } | null
  }
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  items: InvoiceItem[]
  subtotal: number
  gst?: { percentage: number; amount: number } | null
  discount: number
  shipping: number
  total: number
  paymentMethod: string
  paymentStatus: string
}

function generateInvoiceHTML(invoice: InvoiceData): string {
  const gstRows = invoice.gst ? `
    <tr>
      <td colspan="4" style="padding:8px;text-align:right">Subtotal</td>
      <td style="padding:8px;text-align:right">₹${invoice.subtotal.toLocaleString()}</td>
    </tr>
    <tr>
      <td colspan="4" style="padding:8px;text-align:right">GST (${invoice.gst.percentage}%)</td>
      <td style="padding:8px;text-align:right">₹${invoice.gst.amount.toLocaleString()}</td>
    </tr>
  ` : ''

  const discountRow = invoice.discount > 0 ? `
    <tr>
      <td colspan="4" style="padding:8px;text-align:right;color:#16a34a">Discount</td>
      <td style="padding:8px;text-align:right;color:#16a34a">-₹${invoice.discount.toLocaleString()}</td>
    </tr>
  ` : ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body style="font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;border-bottom:3px solid #000;padding-bottom:20px">
        <div>
          <h1 style="font-size:28px;letter-spacing:4px;margin:0">${invoice.store.name}</h1>
          <p style="color:#666;font-size:12px;margin-top:4px">${invoice.store.address}</p>
          <p style="color:#666;font-size:12px">${invoice.store.email} | ${invoice.store.phone}</p>
          ${invoice.store.gst ? `<p style="color:#666;font-size:12px">GSTIN: ${invoice.store.gst.number}</p>` : ''}
        </div>
        <div style="text-align:right">
          <h2 style="font-size:20px;margin:0;color:#333">TAX INVOICE</h2>
          <p style="font-size:12px;color:#666;margin:4px 0">Invoice #: ${invoice.invoiceNumber}</p>
          <p style="font-size:12px;color:#666;margin:4px 0">Date: ${new Date(invoice.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p style="font-size:12px;color:#666;margin:4px 0">Order: #${invoice.orderId.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:30px">
        <div>
          <p style="font-size:11px;text-transform:uppercase;color:#999;margin:0 0 4px">Bill To</p>
          <p style="font-size:14px;font-weight:bold;margin:0">${invoice.customer.name}</p>
          <p style="font-size:12px;color:#666;margin:2px 0">${invoice.customer.address}</p>
          <p style="font-size:12px;color:#666;margin:2px 0">${invoice.customer.city}, ${invoice.customer.state} ${invoice.customer.pincode}</p>
          <p style="font-size:12px;color:#666;margin:2px 0">${invoice.customer.email}</p>
          <p style="font-size:12px;color:#666;margin:2px 0">${invoice.customer.phone}</p>
        </div>
        <div style="text-align:right">
          <p style="font-size:11px;text-transform:uppercase;color:#999;margin:0 0 4px">Payment</p>
          <p style="font-size:12px;color:#666;margin:2px 0">Method: ${invoice.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
          <p style="font-size:12px;color:${invoice.paymentStatus === 'paid' ? '#16a34a' : '#d97706'};margin:2px 0;font-weight:bold">
            ${invoice.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
          </p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;color:#666">Item</th>
            <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#666">Qty</th>
            <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;color:#666">Size</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;color:#666">Rate</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;color:#666">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 8px;font-size:13px">
                ${item.title}
                ${item.color ? `<span style="color:#999;font-size:11px"> - ${item.color}</span>` : ''}
              </td>
              <td style="padding:10px 8px;text-align:center;font-size:13px">${item.quantity}</td>
              <td style="padding:10px 8px;text-align:center;font-size:13px;color:#666">${item.size || '-'}</td>
              <td style="padding:10px 8px;text-align:right;font-size:13px">₹${item.price.toLocaleString()}</td>
              <td style="padding:10px 8px;text-align:right;font-size:13px">₹${item.total.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          ${gstRows}
          ${discountRow}
          <tr>
            <td colspan="4" style="padding:10px 8px;text-align:right;font-size:13px;color:#666">Shipping</td>
            <td style="padding:10px 8px;text-align:right;font-size:13px">FREE</td>
          </tr>
          <tr style="border-top:2px solid #000">
            <td colspan="4" style="padding:12px 8px;text-align:right;font-size:15px;font-weight:bold">Total</td>
            <td style="padding:12px 8px;text-align:right;font-size:15px;font-weight:bold">₹${invoice.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align:center;padding-top:30px;border-top:1px solid #eee;color:#999;font-size:11px">
        <p style="margin:2px 0">Thank you for shopping with ${invoice.store.name}!</p>
        <p style="margin:2px 0">This is a computer-generated invoice.</p>
      </div>
    </body>
    </html>
  `
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
        a.download = `MARVVN-Invoice-${orderId.slice(0, 8).toUpperCase()}.html`
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
