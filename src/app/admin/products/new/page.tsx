'use client'

import { useState, useEffect, useRef } from 'react'
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
  ImageIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types/database'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'

export default function NewProductPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
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
  const [galleryImages, setGalleryImages] = useState<string[]>([])

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
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (name === 'title' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(value),
      }))
    }
  }

  const uploadImages = async (files: FileList, isMain: boolean) => {
    setUploading(true)
    const form = new FormData()
    Array.from(files).forEach(f => form.append('files', f))

    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const { urls, error } = await res.json()

    if (error) {
      alert('Upload failed: ' + error)
      setUploading(false)
      return
    }

    if (isMain && urls[0]) {
      setFormData(prev => ({ ...prev, image_url: urls[0] }))
    } else {
      setGalleryImages(prev => [...prev, ...urls])
    }
    setUploading(false)
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const productData = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title),
      description: formData.description || null,
      price: parseFloat(formData.price) || 0,
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      images: galleryImages.length > 0 ? galleryImages : null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      featured: formData.featured,
      active: formData.active,
    }

    const { error } = await fetch('/api/admin/crud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'products', action: 'insert', data: productData }),
    }).then(r => r.json())

    if (error) {
      alert('Error creating product: ' + error)
      setLoading(false)
      return
    }

    router.push('/admin/products')
  }

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
          {/* Main Content */}
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
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Premium Wool Blanket"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Slug</label>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="auto-generated from title"
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your product..."
                    rows={4}
                  />
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
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Compare at Price</label>
                  <Input
                    name="compare_at_price"
                    type="number"
                    step="0.01"
                    value={formData.compare_at_price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                  <p className="text-slate-400 text-xs mt-1">Original price for showing discount</p>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6 border-2 border-light-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                Images
              </h2>
              <div className="space-y-6">
                {/* Main Image Upload */}
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Main Image *</label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadImages(e.target.files, true)} />
                  
                  {formData.image_url ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-light-200 group">
                      <Image src={formData.image_url} alt="Main" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                          Replace
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => setFormData(p => ({ ...p, image_url: '' }))}>
                          Remove
                        </Button>
                      </div>
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold">
                        Main
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full h-48 rounded-2xl border-2 border-dashed border-light-300 hover:border-primary-400 hover:bg-primary-50/50 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-primary-500"
                    >
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8" />
                          <span className="font-medium">Click to upload main image</span>
                          <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Or paste URL */}
                <div>
                  <label className="text-slate-600 text-xs font-medium mb-1 block">Or paste image URL:</label>
                  <div className="flex gap-2">
                    <Input
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Additional Images</label>
                  <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadImages(e.target.files, false)} />

                  {galleryImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {galleryImages.map((url, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-light-200 group">
                          <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-coral-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-light-300 hover:border-primary-400 hover:bg-primary-50/50 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-primary-500"
                  >
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    <span className="text-xs mt-1">Add</span>
                  </button>
                </div>
              </div>
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
                  <div
                    className={`w-14 h-7 rounded-full transition-colors ${
                      formData.active ? 'bg-primary-400' : 'bg-light-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        formData.active ? 'translate-x-8' : 'translate-x-1'
                      } mt-1`}
                    />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl hover:bg-secondary-50 transition-colors">
                  <span className="text-slate-600 font-medium flex items-center gap-2">
                    ⭐ Featured
                  </span>
                  <div
                    className={`w-14 h-7 rounded-full transition-colors ${
                      formData.featured ? 'bg-secondary-400' : 'bg-light-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        formData.featured ? 'translate-x-8' : 'translate-x-1'
                      } mt-1`}
                    />
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
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-2xl border-2 border-light-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 text-sm font-medium mb-2 block">Stock Quantity</label>
                  <Input
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6 border-2 border-light-200 bg-gradient-to-br from-primary-50 to-white">
              <Button type="submit" className="w-full" disabled={loading || uploading}>
                <Save className="mr-2 h-5 w-5" />
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
