import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Ensure the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.id === 'product-images')

    if (!bucketExists) {
      await supabase.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const uploadedUrls: string[] = []

    for (const file of files) {
      if (!file || file.size === 0) continue

      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(urlData.publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
