import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Save all variants for a product (replaces existing)
export async function POST(req: NextRequest) {
  try {
    const { product_id, options, variants } = await req.json()
    if (!product_id) {
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 })
    }

    const supabase = getClient()

    // Delete existing variants for this product
    await supabase.from('product_variants').delete().eq('product_id', product_id)
    await supabase.from('variant_value_combinations').delete().eq('variant_id', '')
    // Delete combos via variant ids first
    const { data: oldVariants } = await supabase.from('product_variants').select('id').eq('product_id', product_id)
    if (oldVariants?.length) {
      await supabase.from('variant_value_combinations').delete().in('variant_id', oldVariants.map(v => v.id))
    }
    await supabase.from('product_variants').delete().eq('product_id', product_id)

    // Delete existing options (cascades to values)
    await supabase.from('variant_options').delete().eq('product_id', product_id)

    if (!options || options.length === 0) {
      return NextResponse.json({ success: true, message: 'Variants cleared' })
    }

    // Create options and values
    const optionIdMap: Record<string, string> = {} // option name -> option id
    const valueIdMap: Record<string, string> = {} // "optionName:valueName" -> value id

    for (const opt of options) {
      const { data: createdOpt, error: optError } = await supabase
        .from('variant_options')
        .insert({ product_id, name: opt.name, position: opt.position || 0 })
        .select('id')
        .single()

      if (optError) return NextResponse.json({ error: optError.message }, { status: 500 })
      optionIdMap[opt.name] = createdOpt.id

      for (let i = 0; i < (opt.values || []).length; i++) {
        const val = opt.values[i]
        const { data: createdVal, error: valError } = await supabase
          .from('variant_values')
          .insert({ option_id: createdOpt.id, value: val, position: i })
          .select('id')
          .single()

        if (valError) return NextResponse.json({ error: valError.message }, { status: 500 })
        valueIdMap[`${opt.name}:${val}`] = createdVal.id
      }
    }

    // Create variants and combinations
    if (variants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i]
        const { data: createdVariant, error: varError } = await supabase
          .from('product_variants')
          .insert({
            product_id,
            title: v.title || null,
            sku: v.sku || null,
            price: v.price || 0,
            compare_at_price: v.compare_at_price || null,
            image_url: v.image_url || null,
            stock_quantity: v.stock_quantity || 0,
            position: i,
          })
          .select('id')
          .single()

        if (varError) return NextResponse.json({ error: varError.message }, { status: 500 })

        // Create combinations
        if (v.selectedValues && v.selectedValues.length > 0) {
          const combos = v.selectedValues
            .map((sv: { option: string; value: string }) => valueIdMap[`${sv.option}:${sv.value}`])
            .filter(Boolean)

          if (combos.length > 0) {
            await supabase.from('variant_value_combinations').insert(
              combos.map((value_id: string) => ({ variant_id: createdVariant.id, value_id }))
            )
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Fetch variants for a product
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')
  if (!productId) {
    return NextResponse.json({ error: 'Missing product_id' }, { status: 400 })
  }

  const supabase = getClient()

  // Fetch options with values
  const { data: options } = await supabase
    .from('variant_options')
    .select('*, values:variant_values(*)')
    .eq('product_id', productId)
    .order('position')

  // Fetch variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('position')

  // Fetch combinations for each variant
  let variantsWithCombos: any[] = []
  if (variants?.length) {
    const { data: combos } = await supabase
      .from('variant_value_combinations')
      .select('*, value:variant_values(*)')
      .in('variant_id', variants.map(v => v.id))

    variantsWithCombos = variants.map(v => ({
      ...v,
      combinations: combos?.filter(c => c.variant_id === v.id) || [],
    }))
  }

  return NextResponse.json({ options: options || [], variants: variantsWithCombos || [] })
}
