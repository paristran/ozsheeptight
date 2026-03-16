// @ts-nocheck
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('name')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Transform the data to include product count
  const categories = data.map(category => ({
    ...category,
    product_count: category.products?.[0]?.count || 0,
    products: undefined,
  }))
  
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  
  const body = await request.json()
  const { name, slug, description, image_url } = body
  
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      image_url,
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
