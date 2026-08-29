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
    .select('*, order_items(*, products(title, price))')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const shipping = order.shipping_address || {}
  const storeSettings = await supabase.from('settings').select('store_name, store_email, store_phone, store_address, gst_number, gst_percentage').single()

  const gst = storeSettings.data?.gst_number ? {
    number: storeSettings.data.gst_number,
    percentage: storeSettings.data.gst_percentage || 12,
  } : null

  const subtotal = order.order_items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
  const gstAmount = gst ? Math.round(subtotal * gst.percentage / 100) : 0

  const invoice = {
    orderId: order.id,
    orderDate: order.created_at,
    invoiceNumber: `INV-${order.id.slice(0, 8).toUpperCase()}`,
    store: {
      name: storeSettings.data?.store_name || 'MARVVN',
      email: storeSettings.data?.store_email || 'marvvnclothing@gmail.com',
      phone: storeSettings.data?.store_phone || '7578017237',
      address: storeSettings.data?.store_address || 'Faridabad',
      gst: gst,
    },
    customer: {
      name: `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim(),
      email: shipping.email,
      phone: shipping.phone,
      address: `${shipping.address || ''}${shipping.apartment ? ', ' + shipping.apartment : ''}`,
      city: shipping.city,
      state: shipping.state,
      pincode: shipping.pincode,
    },
    items: order.order_items?.map((item: any) => ({
      title: item.products?.title || 'Product',
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
      total: item.price * item.quantity,
    })) || [],
    subtotal,
    gst: gst ? { percentage: gst.percentage, amount: gstAmount } : null,
    discount: order.discount || 0,
    shipping: 0,
    total: order.total,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
  }

  return NextResponse.json({ invoice })
}
