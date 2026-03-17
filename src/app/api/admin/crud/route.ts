import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin API route that bypasses RLS using service role key
const getAdminClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Service role key not configured')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { table, action, data, id, ids, filters } = body

    const validTables = ['products', 'categories', 'orders']
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // INSERT
    if (action === 'insert') {
      const { error } = await supabase.from(table).insert(data)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // UPDATE
    if (action === 'update' && id) {
      const { error } = await supabase.from(table).update(data).eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // DELETE single
    if (action === 'delete' && id) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // DELETE many
    if (action === 'delete-many' && Array.isArray(ids)) {
      const { error } = await supabase.from(table).delete().in('id', ids)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, deleted: ids.length })
    }

    // UPDATE with custom filters
    if (action === 'update-filter' && filters) {
      let query = supabase.from(table).update(data)
      for (const [key, value] of Object.entries(filters as Record<string, string>)) {
        query = query.eq(key, value)
      }
      const { error } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
