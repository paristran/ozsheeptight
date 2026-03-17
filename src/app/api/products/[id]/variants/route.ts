import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')
  if (!productId) {
    return NextResponse.json({ error: 'Missing product_id' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: options } = await supabase
    .from('variant_options')
    .select('*, values:variant_values(*)')
    .eq('product_id', productId)
    .order('position')

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('position')

  let variantsWithCombos: any[] = []
  if (variants?.length) {
    const { data: combos } = await supabase
      .from('variant_value_combinations')
      .select('*, value:variant_values(option_id, value, position)')
      .in('variant_id', variants.map(v => v.id))

    variantsWithCombos = variants.map(v => ({
      ...v,
      combinations: combos?.filter(c => c.variant_id === v.id) || [],
    }))
  }

  return NextResponse.json({ options: options || [], variants: variantsWithCombos || [] })
}
