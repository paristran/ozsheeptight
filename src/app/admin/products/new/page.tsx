'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Save,
  Upload,
  X,
  Loader2,
  Plus,
  Trash2,
  Layers
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types/database'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'

interface VariantOptionForm {
  id: string
  name: string
  values: string[]
}

interface VariantForm {
  id: string
  title: string
  price: string
  compare_at_price: string
  stock_quantity: string
  image_url: string
  sku: string
  selectedValues: { option: string; value: string }[]
}

// Helper: upload a single file to Supabase Storage
async function uploadFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('files', file)
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  const { urls, error } = await res.json()
  if (error) throw new Error(error)
  return urls[0]
}

function generateCombinations(options: VariantOptionForm[]): { option: string; value: string }[][] {
  if (options.length === 0) return []
  let result: { option: string; value: string }[][] = [[]]
  for (const opt of options) {
    if (opt.values.length === 0) continue
    const newResult: { option: string; value: string }[][] = []
    for (const combo of result) {
      for (const val of opt.values) {
        newResult.push([...combo, { option: opt.name, value: val }])
      }
    }
    result = newResult
  }
  return result
}

export default function NewProductPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    image_url: '',
    stock_quantity: '0',
    featured: false,
    active: true,
  })
  // Preview URLs (local blob or existing URL)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  // Existing gallery URLs (pasted, not from file upload)
  const [galleryUrlInputs, setGalleryUrlInputs] = useState<string[]>([])

  const [variantOptions, setVariantOptions] = useState<VariantOptionForm[]>([])
  const [variantRows, setVariantRows] = useState<VariantForm[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'title' && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: slugify(value) }))
    }
  }

  // Main image: preview locally, store file for later upload
  const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMainImageFile(file)
    setMainImagePreview(URL.createObjectURL(file))
    setFormData(prev => ({ ...prev, image_url: '' })) // clear any pasted URL
    e.target.value = '' // reset so same file can be re-selected
  }

  const removeMainImage = () => {
    setMainImageFile(null)
    setMainImagePreview(null)
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  // Gallery: preview locally, store files for later upload
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const newFiles = Array.from(files)
    setGalleryFiles(prev => [...prev, ...newFiles])
    setGalleryPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeGalleryImage = (index: number) => {
    // Check if it's a URL-based image or file-based
    if (index < galleryUrlInputs.length) {
      // It's a URL image
      const urlIndex = index
      setGalleryUrlInputs(prev => prev.filter((_, i) => i !== urlIndex))
    } else {
      // It's a file-based image
      const fileIndex = index - galleryUrlInputs.length
      setGalleryFiles(prev => prev.filter((_, i) => i !== fileIndex))
    }
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const addGalleryUrl = () => {
    setGalleryUrlInputs(prev => [...prev, ''])
    setGalleryPreviews(prev => [...prev, ''])
  }

  const updateGalleryUrl = (index: number, value: string) => {
    const updated = [...galleryUrlInputs]
    updated[index] = value
    setGalleryUrlInputs(updated)
    const previews = [...galleryPreviews]
    previews[index] = value
    setGalleryPreviews(previews)
  }

  // --- Variation handlers ---
  const addOption = () => {
    setVariantOptions(prev => [...prev, { id: `opt_${Date.now()}`, name: '', values: [] }])
  }

  const removeOption = (optId: string) => {
    setVariantOptions(prev => prev.filter(o => o.id !== optId))
    regenerateVariants()
  }

  const updateOptionName = (optId: string, name: string) => {
    setVariantOptions(prev => prev.map(o => o.id === optId ? { ...o, name } : o))
  }

  const [newValueInput, setNewValueInput] = useState<Record<string, string>>({})

  const addValue = (optId: string) => {
    const val = (newValueInput[optId] || '').trim()
    if (!val) return
    setVariantOptions(prev => prev.map(o => o.id === optId ? { ...o, values: [...o.values, val] } : o))
    setNewValueInput(prev => ({ ...prev, [optId]: '' }))
  }

  const removeValue = (optId: string, value: string) => {
    setVariantOptions(prev => prev.map(o => o.id === optId ? { ...o, values: o.values.filter(v => v !== value) } : o))
  }

  const regenerateVariants = useCallback(() => {
    const validOptions = variantOptions.filter(o => o.name && o.values.length > 0)
    const combos = generateCombinations(validOptions)
    setVariantRows(combos.map((combo, i) => ({
      id: `var_${Date.now()}_${i}`,
      title: combo.map(c => c.value).join(' / '),
      price: formData.price || '0',
      compare_at_price: '',
      stock_quantity: '0',
      image_url: '',
      sku: '',
      selectedValues: combo,
    })))
  }, [variantOptions, formData.price])

  const updateVariantRow = (varId: string, field: string, value: string) => {
    setVariantRows(prev => prev.map(v => v.id === varId ? { ...v, [field]: value } : v))
  }

  const removeVariantRow = (varId: string) => {
    setVariantRows(prev => prev.filter(v => v.id !== varId))
  }

  // --- Submit: upload images then create product ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Upload main image
      let mainImageUrl = formData.image_url // could be pasted URL
      if (mainImageFile) {
        setUploadProgress('Uploading main image...')
        mainImageUrl = await uploadFile(mainImageFile)
      }

      // 2. Upload gallery images
      let galleryUrls: string[] = []
      for (let i = 0; i < galleryFiles.length; i++) {
        setUploadProgress(`Uploading gallery image ${i + 1}/${galleryFiles.length}...`)
        const url = await uploadFile(galleryFiles[i])
        galleryUrls.push(url)
      }
      // Add pasted URLs
      galleryUrls = [...galleryUrls, ...galleryUrlInputs.filter(u => u.trim())]
      if (galleryUrls.length === 0) galleryUrls = [] as any // keep empty

      // 3. Create product
      setUploadProgress('Creating product...')
      const productData = {
        title: formData.title,
        slug: formData.slug || slugify(formData.title),
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id || null,
        image_url: mainImageUrl || null,
        images: galleryUrls.length > 0 ? galleryUrls : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        featured: formData.featured,
        active: formData.active,
      }

      const productRes = await fetch('/api/admin/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'products', action: 'insert', data: productData }),
      }).then(r => r.json())

      if (productRes.error) {
        alert('Error creating product: ' + productRes.error)
        setLoading(false)
        setUploadProgress('')
        return
      }

      // 4. Save variants
      const validOptions = variantOptions.filter(o => o.name && o.values.length > 0)
      if (validOptions.length > 0 && variantRows.length > 0) {
        setUploadProgress('Saving variants...')
        const supabase = createClient()
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('title', formData.title)
          .order('created_at', { ascending: false })
          .limit(1)
          .single() as any

        if (product) {
          await fetch('/api/admin/variants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: product.id,
              options: validOptions.map((o, i) => ({ name: o.name, values: o.values, position: i })),
              variants: variantRows.map((v, i) => ({
                title: v.title,
                sku: v.sku || null,
                price: parseFloat(v.price) || 0,
                compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
                image_url: v.image_url || null,
                stock_quantity: parseInt(v.stock_quantity) || 0,
                position: i,
                selectedValues: v.selectedValues,
              })),
            }),
          })
        }
      }

      router.push('/admin/products')
    } catch (err: any) {
      alert('Error: ' + err.message)
      setLoading(false)
      setUploadProgress('')
    }
  }

  const displayMainPreview = mainImagePreview || (formData.image_url || null)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="rounded-2xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            📦 Add Product
          </h1>
          <p className="text-slate-500 mt-1">Create a new product for your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6 border-2 border-light-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Product Title *</label>
                  <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Premium Wool Blanket" required />
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Slug</label>
                  <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated from title" />
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Description</label>
                  <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your product..." rows={4} />
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-6 border-2 border-light-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">💰</span>
                Pricing
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Price (AUD) *</label>
                  <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" required />
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Compare at Price</label>
                  <Input name="compare_at_price" type="number" step="0.01" value={formData.compare_at_price} onChange={handleChange} placeholder="0.00" />
                  <p className="text-slate-400 text-xs mt-1">Original price for showing discount</p>
                </div>
              </div>
            </Card>

            {/* Images — local preview only */}
            <Card className="p-6 border-2 border-light-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                Images
              </h2>
              <p className="text-slate-400 text-xs mb-4">Images are previewed locally and uploaded only when you click &quot;Create Product&quot;.</p>

              {/* Main Image */}
              <div className="mb-6">
                <label className="text-slate-600 text-sm font-medium mb-2 block">Main Image *</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageSelect} />

                {displayMainPreview ? (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-light-200 group">
                    <Image src={displayMainPreview} alt="Main preview" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>Replace</Button>
                      <Button type="button" variant="destructive" size="sm" onClick={removeMainImage}>Remove</Button>
                    </div>
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold">Main</div>
                    {mainImageFile && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-accent-500 text-white text-xs font-bold">Local</div>
                    )}
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-48 rounded-2xl border-2 border-dashed border-light-300 hover:border-primary-400 hover:bg-primary-50/50 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-primary-500">
                    <Upload className="h-8 w-8" />
                    <span className="font-medium">Click to upload main image</span>
                    <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
                  </button>
                )}

                <div className="mt-2">
                  <label className="text-slate-500 text-xs">Or paste image URL:</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, image_url: e.target.value }))
                      if (e.target.value) { setMainImageFile(null); setMainImagePreview(null) }
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-600 text-sm font-medium">Additional Images</label>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={addGalleryUrl}>
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add URL
                    </Button>
                    <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGallerySelect} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => galleryRef.current?.click()}>
                      <Upload className="mr-1 h-3.5 w-3.5" /> Upload Files
                    </Button>
                  </div>
                </div>

                {/* All gallery previews */}
                {galleryPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {galleryPreviews.map((preview, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-light-200 group">
                        {preview ? (
                          <Image src={preview} alt={`Gallery ${i + 1}`} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-light-100" />
                        )}
                        <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-coral-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 text-center text-white text-xs font-bold px-1 py-0.5 bg-black/50 rounded-b-lg">
                          #{i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL input fields */}
                {galleryUrlInputs.map((url, i) => (
                  <div key={i} className="mt-2 flex gap-2">
                    <Input value={url} onChange={e => updateGalleryUrl(i, e.target.value)} placeholder="https://example.com/image.jpg" className="text-sm" />
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-coral-500" onClick={() => removeGalleryImage(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {galleryPreviews.length === 0 && galleryUrlInputs.length === 0 && (
                  <p className="text-slate-400 text-xs text-center py-4">No additional images yet</p>
                )}
              </div>
            </Card>

            {/* Variations */}
            <Card className="p-6 border-2 border-light-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  Variations
                </h2>
                <Button type="button" variant="secondary" size="sm" onClick={addOption}>
                  <Plus className="mr-1 h-4 w-4" /> Add Option
                </Button>
              </div>

              {variantOptions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-light-200 rounded-2xl">
                  <Layers className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No variations yet</p>
                  <p className="text-slate-400 text-xs mt-1">Add options like Color, Size, etc.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variantOptions.map((opt, optIdx) => (
                    <div key={opt.id} className="p-4 rounded-2xl bg-light-50 border border-light-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-slate-500">Option {optIdx + 1}</span>
                        <Input value={opt.name} onChange={e => updateOptionName(opt.id, e.target.value)} placeholder="e.g., Color, Size" className="flex-1 h-9 text-sm" />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-coral-500" onClick={() => removeOption(opt.id)}><X className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {opt.values.map(val => (
                          <span key={val} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border-2 border-primary-200 text-primary-700 text-sm font-medium">
                            {val}
                            <button type="button" onClick={() => removeValue(opt.id, val)} className="text-primary-400 hover:text-coral-500"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input value={newValueInput[opt.id] || ''} onChange={e => setNewValueInput(prev => ({ ...prev, [opt.id]: e.target.value }))} placeholder="Add value (e.g., Red, Small)" className="flex-1 h-9 text-sm" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addValue(opt.id))} />
                        <Button type="button" variant="ghost" size="sm" onClick={() => addValue(opt.id)}>Add</Button>
                      </div>
                    </div>
                  ))}

                  {variantOptions.some(o => o.values.length > 0) && (
                    <Button type="button" onClick={regenerateVariants} className="w-full">
                      🔄 Generate {generateCombinations(variantOptions.filter(o => o.name && o.values.length > 0)).length} Variants
                    </Button>
                  )}

                  {variantRows.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-light-200">
                            <th className="text-left text-slate-500 py-2 px-2 font-semibold">Variant</th>
                            <th className="text-left text-slate-500 py-2 px-2 font-semibold">SKU</th>
                            <th className="text-left text-slate-500 py-2 px-2 font-semibold">Price</th>
                            <th className="text-left text-slate-500 py-2 px-2 font-semibold">Compare</th>
                            <th className="text-left text-slate-500 py-2 px-2 font-semibold">Stock</th>
                            <th className="text-left text-slate-500 py-2 px-2 font-semibold">Image</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {variantRows.map(row => (
                            <tr key={row.id} className="border-b border-light-100">
                              <td className="py-2 px-2"><span className="font-medium text-slate-700">{row.title}</span></td>
                              <td className="py-2 px-2"><Input value={row.sku} onChange={e => updateVariantRow(row.id, 'sku', e.target.value)} className="h-8 text-xs w-24" placeholder="SKU" /></td>
                              <td className="py-2 px-2"><Input value={row.price} onChange={e => updateVariantRow(row.id, 'price', e.target.value)} type="number" step="0.01" className="h-8 text-xs w-20" /></td>
                              <td className="py-2 px-2"><Input value={row.compare_at_price} onChange={e => updateVariantRow(row.id, 'compare_at_price', e.target.value)} type="number" step="0.01" className="h-8 text-xs w-20" placeholder="0.00" /></td>
                              <td className="py-2 px-2"><Input value={row.stock_quantity} onChange={e => updateVariantRow(row.id, 'stock_quantity', e.target.value)} type="number" className="h-8 text-xs w-16" /></td>
                              <td className="py-2 px-2"><Input value={row.image_url} onChange={e => updateVariantRow(row.id, 'image_url', e.target.value)} className="h-8 text-xs w-28" placeholder="URL" /></td>
                              <td className="py-2 px-2">
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-coral-500" onClick={() => removeVariantRow(row.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="p-6 border-2 border-light-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                Status
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl hover:bg-light-50 transition-colors">
                  <span className="text-slate-600 font-medium">Active</span>
                  <div className={`w-14 h-7 rounded-full transition-colors ${formData.active ? 'bg-primary-400' : 'bg-light-300'}`} onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${formData.active ? 'translate-x-8' : 'translate-x-1'} mt-1`} />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl hover:bg-secondary-50 transition-colors">
                  <span className="text-slate-600 font-medium flex items-center gap-2">⭐ Featured</span>
                  <div className={`w-14 h-7 rounded-full transition-colors ${formData.featured ? 'bg-secondary-400' : 'bg-light-300'}`} onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${formData.featured ? 'translate-x-8' : 'translate-x-1'} mt-1`} />
                  </div>
                </label>
              </div>
            </Card>

            {/* Organization */}
            <Card className="p-6 border-2 border-light-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📂</span>
                Organization
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full h-12 px-4 rounded-2xl border-2 border-light-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 appearance-none cursor-pointer">
                    <option value="">Select category</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Stock Quantity</label>
                  <Input name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} placeholder="0" />
                </div>
              </div>
            </Card>

            {/* Upload Progress */}
            {uploadProgress && (
              <Card className="p-4 border-2 border-primary-200 bg-primary-50">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                  <span className="text-primary-700 text-sm font-medium">{uploadProgress}</span>
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-6 border-2 border-light-200 bg-gradient-to-br from-primary-50 to-white">
              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="mr-2 h-5 w-5" />
                {loading ? uploadProgress || 'Creating...' : 'Create Product'}
              </Button>
              {loading && (
                <p className="text-slate-400 text-xs text-center mt-2">Uploading images & creating product...</p>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
