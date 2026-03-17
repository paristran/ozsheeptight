import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { id } = await params
  
  // Fetch product
  const { data: product, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  
  // Fetch variant options with values
  const { data: variantOptions } = await supabase
    .from('variant_options')
    .select(`
      *,
      values:variant_values(*)
    `)
    .eq('product_id', id)
    .order('position', { ascending: true })
  
  // Fetch product variants with their value combinations
  const { data: variants } = await supabase
    .from('product_variants')
    .select(`
      *,
      value_combinations:variant_value_combinations(
        value_id,
        value:variant_values(*)
      )
    `)
    .eq('product_id', id)
    .order('position', { ascending: true })
  
  return NextResponse.json({
    ...product,
    variant_options: variantOptions || [],
    variants: variants || []
  })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { id } = await params
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('products')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { id } = await params
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
