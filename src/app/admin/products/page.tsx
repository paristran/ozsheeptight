'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  Package,
  Filter,
  X,
  Upload
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/lib/types/database'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .order('name'),
    ])

    if (productsRes.data) setProducts(productsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    setLoading(false)
  }

  async function deleteProduct(id: string) {
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter(p => p.id !== id))
    setShowDeleteModal(null)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            📦 Products
          </h1>
          <p className="text-slate-500 mt-1">
            {products.length} {products.length === 1 ? 'product' : 'products'} total
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </Link>
          <Link href="/admin/products/bulk">
            <Button variant="secondary">
              <Upload className="mr-2 h-5 w-5" />
              Bulk Upload
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border-2 border-light-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-12 pl-12 pr-10 rounded-2xl border-2 border-light-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden border-2 border-light-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner-fun mx-auto" />
            <p className="text-slate-500 mt-4">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
              <Package className="h-10 w-10 text-primary-400" />
            </div>
            <h3 className="text-slate-800 text-lg font-semibold mb-2">No products found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your filters'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && !selectedCategory && (
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Product
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-light-200 bg-light-50">
                  <th className="text-left text-slate-500 text-sm font-semibold px-6 py-4">Product</th>
                  <th className="text-left text-slate-500 text-sm font-semibold px-6 py-4">Category</th>
                  <th className="text-left text-slate-500 text-sm font-semibold px-6 py-4">Price</th>
                  <th className="text-left text-slate-500 text-sm font-semibold px-6 py-4">Stock</th>
                  <th className="text-left text-slate-500 text-sm font-semibold px-6 py-4">Status</th>
                  <th className="text-right text-slate-500 text-sm font-semibold px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-light-200 hover:bg-light-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 to-purple-50 shrink-0 border-2 border-light-200">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl">🐑</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-slate-800 font-semibold">{product.title}</p>
                            <p className="text-slate-400 text-sm">{formatDate(product.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">
                          {(product as any).category?.name || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 font-semibold">{formatPrice(product.price)}</span>
                          {product.compare_at_price && (
                            <span className="text-slate-400 line-through text-sm">
                              {formatPrice(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                          product.stock_quantity > 10 
                            ? 'bg-accent-50 text-accent-600 border border-accent-200' 
                            : product.stock_quantity > 0 
                              ? 'bg-secondary-50 text-secondary-600 border border-secondary-200'
                              : 'bg-coral-50 text-coral-500 border border-coral-200'
                        }`}>
                          {product.stock_quantity > 10 ? '✓' : product.stock_quantity > 0 ? '⚠️' : '✗'}
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {product.featured && (
                            <Badge variant="warning">⭐ Featured</Badge>
                          )}
                          <Badge variant={product.active ? 'success' : 'secondary'}>
                            {product.active ? '✓ Active' : 'Draft'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/product/${product.id}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary-50 hover:text-primary-600">
                              <Eye className="h-5 w-5" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-purple-50 hover:text-purple-600">
                              <Edit className="h-5 w-5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl text-coral-500 hover:bg-coral-50 hover:text-coral-600"
                            onClick={() => setShowDeleteModal(product.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <Card className="p-6 max-w-md w-full border-2 border-light-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-coral-100 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Product</h3>
                  <p className="text-slate-500">
                    Are you sure you want to delete this product? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowDeleteModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => deleteProduct(showDeleteModal)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
