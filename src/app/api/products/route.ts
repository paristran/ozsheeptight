import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createServerClient()
  const { searchParams } = new URL(request.url)
  
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const limit = searchParams.get('limit')
  const search = searchParams.get('search')
  
  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('active', true)
  
  if (category) {
    query = query.eq('category_id', category)
  }
  
  if (featured === 'true') {
    query = query.eq('featured', true)
  }
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }
  
  if (limit) {
    query = query.limit(parseInt(limit))
  }
  
  query = query.order('created_at', { ascending: false })
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  
  const body = await request.json()
  const { title, slug, description, price, compare_at_price, category_id, image_url, images, stock_quantity, featured, active } = body
  
  const { data, error } = await supabase
    .from('products')
    .insert({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      price,
      compare_at_price,
      category_id,
      image_url,
      images,
      stock_quantity: stock_quantity ?? 0,
      featured: featured ?? false,
      active: active ?? true,
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
