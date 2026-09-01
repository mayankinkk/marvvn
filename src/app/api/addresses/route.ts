import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ addresses: [] })
  }

  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ addresses })
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { firstName, lastName, address, apartment, city, state, pincode, phone, isDefault } = await request.json()

  if (!firstName || !lastName || !address || !city || !state || !pincode) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // If this is set as default, unset other defaults
  if (isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const { data: addressData, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      address,
      apartment: apartment || null,
      city,
      state,
      pincode,
      phone: phone || null,
      is_default: isDefault || false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ address: addressData }, { status: 201 })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, firstName, lastName, address, apartment, city, state, pincode, phone, isDefault } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
  }

  // If this is set as default, unset other defaults
  if (isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
      .neq('id', id)
  }

  const { error } = await supabase
    .from('addresses')
    .update({
      first_name: firstName,
      last_name: lastName,
      address,
      apartment: apartment || null,
      city,
      state,
      pincode,
      phone: phone || null,
      is_default: isDefault || false,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
