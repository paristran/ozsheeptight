'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, Star, Package, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/lib/types/database'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCategoryAndProducts()
  }, [resolvedParams.id])

  async function fetchCategoryAndProducts() {
    const supabase = createClient()
    
    const [categoryRes, productsRes] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('id', resolvedParams.id)
        .single() as any,
      supabase
        .from('products')
        .select('*')
        .eq('category_id', resolvedParams.id)
        .eq('active', true)
        .order('created_at', { ascending: false }) as any,
    ])

    if (categoryRes.data) setCategory(categoryRes.data)
    if (productsRes.data) setProducts(productsRes.data)
    setLoading(false)
  }

  const toggleFavorite = (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-light-200 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-light-200 rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📂</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Category Not Found</h1>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30">
      {/* Breadcrumb */}
      <div className="py-6 bg-white/50 border-b border-light-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-primary-600 transition-colors">
              🏠 Home
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <Link href="/products" className="text-slate-500 hover:text-primary-600 transition-colors">
              Products
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="text-slate-800 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative py-16 overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          {category.image_url ? (
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover opacity-20"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-white to-purple-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/80 to-white" />
          <div className="absolute inset-0 bg-fun-dots opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-5xl mb-4 block">📂</span>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border-2 border-light-200 shadow-soft">
                <Package className="h-5 w-5 text-primary-500" />
                <span className="text-slate-700 font-medium">
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
              <Package className="h-10 w-10 text-primary-400" />
            </div>
            <h3 className="text-slate-800 text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-slate-500 mb-6">
              We're adding products to this category. Check back soon! 🌟
            </p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={`/product/${product.id}`}>
                  <Card className="group overflow-hidden border-2 border-transparent hover:border-primary-200 transition-all duration-300 cursor-pointer">
                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary-50 to-purple-50">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl">🐑</span>
                        </div>
                      )}
                      
                      {product.featured && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary-300 to-secondary-400 text-slate-800 text-xs font-semibold shadow-soft">
                          ⭐ Featured
                        </div>
                      )}

                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <div className="absolute top-4 right-14 px-3 py-1.5 rounded-full bg-gradient-to-r from-coral-400 to-coral-500 text-white text-xs font-semibold">
                          -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
                      >
                        <Heart 
                          className={`h-5 w-5 transition-colors ${
                            favorites.has(product.id) 
                              ? 'text-pink-500 fill-pink-500' 
                              : 'text-slate-400'
                          }`} 
                        />
                      </button>

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                        <span className="px-6 py-3 rounded-2xl bg-white text-slate-800 font-semibold text-sm shadow-soft">
                          👀 Quick View
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-white">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-secondary-400 fill-secondary-400" />
                        ))}
                        <span className="text-slate-400 text-sm ml-2">(24)</span>
                      </div>

                      <h3 className="text-slate-800 font-bold text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      
                      <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 font-bold text-xl">
                            {formatPrice(product.price)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-slate-400 line-through text-sm">
                              {formatPrice(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                        
                        {product.stock_quantity > 0 ? (
                          <span className="text-accent-600 text-sm font-medium">✓ In Stock</span>
                        ) : (
                          <span className="text-coral-500 text-sm font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
