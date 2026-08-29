import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(title, handle, images))')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const shipping = order.shipping_address || {}

  const { data: settingsRows } = await supabase.from('store_settings').select('key, value')
  const settings: Record<string, string> = {}
  ;(settingsRows || []).forEach((row: any) => { settings[row.key] = row.value })

  const gstNumber = settings.invoice_gst_number || ''
  const gstPercentage = parseFloat(settings.invoice_gst_percentage || '12')
  const shippingFee = parseFloat(settings.shipping_fee || '0')

  const subtotal = order.order_items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
  const gstAmount = gstNumber ? Math.round(subtotal * gstPercentage / 100) : 0
  const discount = order.discount || 0

  const invoice = {
    orderId: order.id,
    orderDate: order.created_at,
    invoiceDate: new Date().toISOString(),
    invoiceNumber: `${settings.invoice_prefix || 'INV'}-${order.id.slice(0, 8).toUpperCase()}`,
    store: {
      name: settings.store_name || 'MARVVN',
      email: settings.store_email || 'marvvnclothing@gmail.com',
      phone: settings.store_phone || '7578017237',
      address: settings.store_address || 'Faridabad',
      logoUrl: settings.invoice_logo_url || '',
      showLogo: settings.invoice_show_logo !== 'false',
      gst: gstNumber ? { number: gstNumber, percentage: gstPercentage } : null,
      showGst: settings.invoice_show_gst !== 'false',
      footerText: settings.invoice_footer_text || 'NOT MADE TO FIT IN. | BUILT FOR THE REAL ONES.',
      terms: settings.invoice_terms || '',
      returnPolicy: settings.invoice_return_policy || '',
    },
    customer: {
      name: `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim(),
      email: shipping.email || '',
      phone: shipping.phone || '',
      address: shipping.address || '',
      apartment: shipping.apartment || '',
      city: shipping.city || '',
      state: shipping.state || '',
      pincode: shipping.pincode || '',
    },
    items: order.order_items?.map((item: any) => ({
      title: item.products?.title || 'Product',
      handle: item.products?.handle || '',
      image: item.products?.images?.[0] || '',
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
      price: item.price,
      total: item.price * item.quantity,
    })) || [],
    subtotal,
    gst: gstNumber ? { percentage: gstPercentage, amount: gstAmount } : null,
    discount,
    shippingFee,
    promoCode: order.promo_code || null,
    total: order.total,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    siteUrl: settings.site_url || 'https://marvvn.online',
  }

  return NextResponse.json({ invoice })
}
