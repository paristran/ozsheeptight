'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Package,
  Loader2,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface UploadResult {
  success: number
  failed: number
  errors: { row: number; title: string; error: string }[]
}

export default function BulkUploadPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)

    try {
      const text = await file.text()
      const lines = text.trim().split('\n')
      if (lines.length < 2) {
        setResult({ success: 0, failed: 0, errors: [{ row: 0, title: '', error: 'CSV file is empty or has no data rows' }] })
        setUploading(false)
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const supabase = createClient()

      // Fetch categories for mapping
      const { data: categories } = await supabase.from('categories').select('*')
      const categoryMap = new Map((categories || []).map((c: any) => [c.name.toLowerCase(), c.id]))

      let success = 0
      let failed = 0
      const errors: UploadResult['errors'] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Simple CSV parse (handles quoted fields)
        const values: string[] = []
        let current = ''
        let inQuotes = false
        for (const char of line) {
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        values.push(current.trim())

        const get = (col: string) => values[headers.indexOf(col)] || ''
        const getNum = (col: string) => parseFloat(get(col)) || 0
        const getBool = (col: string) => get(col).toLowerCase() === 'true'

        const title = get('title')
        if (!title) {
          failed++
          errors.push({ row: i + 1, title: '(empty)', error: 'Missing product title' })
          continue
        }

        const categoryName = get('category')
        const categoryId = categoryName ? categoryMap.get(categoryName.toLowerCase()) || null : null

        if (categoryName && !categoryId) {
          // Try to create category
          const { data: newCat } = await supabase.from('categories').insert({
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: `${categoryName} products`,
          }).select('id').single() as any
          if (newCat) {
            categoryMap.set(categoryName.toLowerCase(), newCat.id)
          }
        }

        const catId = categoryName ? categoryMap.get(categoryName.toLowerCase()) || null : null

        const productData = {
          title,
          slug: get('slug') || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: get('description') || null,
          price: getNum('price'),
          compare_at_price: get('compare_at_price') || null,
          category_id: catId,
          image_url: get('image_url') || null,
          images: get('images') ? get('images').split('|').map(s => s.trim()).filter(Boolean) : null,
          stock_quantity: parseInt(get('stock_quantity')) || 0,
          featured: getBool('featured'),
          active: getBool('active'),
        }

        const { error } = await supabase.from('products').insert(productData as any)

        if (error) {
          failed++
          errors.push({ row: i + 1, title, error: error.message })
        } else {
          success++
        }
      }

      setResult({ success, failed, errors })
    } catch (err: any) {
      setResult({ success: 0, failed: 0, errors: [{ row: 0, title: '', error: err.message }] })
    } finally {
      setUploading(false)
    }
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
            📤 Bulk Upload Products
          </h1>
          <p className="text-slate-500 mt-1">Add multiple products at once via CSV</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <Card className="p-8 border-2 border-light-200">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-primary-400 bg-primary-50 scale-[1.02]'
                  : file
                    ? 'border-accent-300 bg-accent-50'
                    : 'border-light-300 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />

              {file ? (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-accent-100 flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-accent-500" />
                  </div>
                  <p className="text-slate-800 font-bold text-lg">{file.name}</p>
                  <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null) }}
                    className="mt-3 text-coral-500 hover:text-coral-600 text-sm font-medium flex items-center gap-1 mx-auto"
                  >
                    <X className="h-4 w-4" /> Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary-500" />
                  </div>
                  <p className="text-slate-800 font-bold text-lg">Drop your CSV file here</p>
                  <p className="text-slate-500 mt-1">or click to browse</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload & Import
                  </>
                )}
              </Button>
              <a href="/product-template.csv" download>
                <Button variant="secondary">
                  <Download className="mr-2 h-5 w-5" />
                  Download Template
                </Button>
              </a>
            </div>
          </Card>

          {/* Result */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-2 border-light-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">📊 Import Results</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-accent-50 border border-accent-200 text-center">
                    <CheckCircle2 className="h-8 w-8 text-accent-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-accent-600">{result.success}</p>
                    <p className="text-accent-500 text-sm">Imported</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-coral-50 border border-coral-200 text-center">
                    <AlertCircle className="h-8 w-8 text-coral-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-coral-600">{result.failed}</p>
                    <p className="text-coral-500 text-sm">Failed</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-3">Errors:</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.errors.map((err, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-coral-50 text-coral-600 text-sm">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Row {err.row}</span>
                            {err.title && <span className="text-coral-400"> — {err.title}</span>}
                            <p>{err.error}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar - CSV Format Guide */}
        <div className="space-y-6">
          <Card className="p-6 border-2 border-light-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📋 CSV Format Guide
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-light-50">
                <p className="text-xs font-mono text-primary-600 font-bold mb-1">Required columns:</p>
                <p className="text-sm text-slate-600">title, price</p>
              </div>
              <div className="p-3 rounded-xl bg-light-50">
                <p className="text-xs font-mono text-slate-500 font-bold mb-1">Optional columns:</p>
                <p className="text-sm text-slate-600">description, compare_at_price, category, slug, image_url, images, stock_quantity, featured, active</p>
              </div>
              <div className="p-3 rounded-xl bg-light-50">
                <p className="text-xs font-mono text-accent-600 font-bold mb-1">Notes:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <code className="bg-light-100 px-1 rounded text-xs">images</code> — use <code className="bg-light-100 px-1 rounded text-xs">|</code> to separate multiple URLs</li>
                  <li>• <code className="bg-light-100 px-1 rounded text-xs">category</code> — auto-creates if not found</li>
                  <li>• <code className="bg-light-100 px-1 rounded text-xs">featured/active</code> — true/false</li>
                  <li>• <code className="bg-light-100 px-1 rounded text-xs">price</code> — in AUD (no $ sign)</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-light-200 bg-gradient-to-br from-primary-50 to-white">
            <h2 className="text-lg font-bold text-slate-800 mb-3">💡 Quick Start</h2>
            <ol className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-primary-100 text-primary-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                Download the template CSV
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary-100 text-primary-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                Fill in your product data
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary-100 text-primary-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                Upload and import!
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
