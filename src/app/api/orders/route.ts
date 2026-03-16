// @ts-nocheck
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { searchParams } = new URL(request.url)
  
  const status = searchParams.get('status')
  const limit = searchParams.get('limit')
  
  let query = supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*))')
    .order('created_at', { ascending: false })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  if (limit) {
    query = query.limit(parseInt(limit))
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  
  const body = await request.json()
  const { customer_email, customer_name, customer_phone, items, shipping_address, notes } = body
  
  // Calculate total
  const total = items.reduce((sum: number, item: { price: number; quantity: number }) => 
    sum + item.price * item.quantity, 0
  )
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_email,
      customer_name,
      customer_phone,
      total,
      status: 'pending',
      shipping_address,
      notes,
    })
    .select()
    .single()
  
  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }
  
  // Create order items
  const orderItems = items.map((item: { product_id: string; quantity: number; price: number }) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) {
    // Rollback order
    await supabase.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }
  
  return NextResponse.json(order, { status: 201 })
}
