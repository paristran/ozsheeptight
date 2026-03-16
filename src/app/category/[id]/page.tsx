'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, Star, Package } from 'lucide-react'
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
        .single(),
      supabase
        .from('products')
        .select('*')
        .eq('category_id', resolvedParams.id)
        .eq('active', true)
        .order('created_at', { ascending: false }),
    ])

    if (categoryRes.data) setCategory(categoryRes.data)
    if (productsRes.data) setProducts(productsRes.data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-dark-800 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-dark-800 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Breadcrumb */}
      <div className="py-6 border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-dark-400 hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-dark-600" />
            <Link href="/products" className="text-dark-400 hover:text-white transition-colors">
              Products
            </Link>
            <ChevronRight className="h-4 w-4 text-dark-600" />
            <span className="text-white">{category.name}</span>
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
              className="object-cover opacity-30"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-secondary-500/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/50 via-dark-950/80 to-dark-950" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-dark-300 text-lg md:text-xl leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/50 backdrop-blur-xl border border-dark-700/50">
                <Package className="h-4 w-4 text-primary-400" />
                <span className="text-dark-200 text-sm">
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-800/50 flex items-center justify-center">
              <Package className="h-8 w-8 text-dark-500" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-dark-400 mb-6">
              We're adding products to this category. Check back soon!
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
                  <Card glass className="group overflow-hidden hover:border-primary-500/50 transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                          <span className="text-dark-500">No image</span>
                        </div>
                      )}
                      
                      {product.featured && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-medium shadow-lg">
                          Featured
                        </div>
                      )}

                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
                          -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                        </div>
                      )}

                      <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="px-6 py-3 rounded-xl bg-white text-dark-950 font-medium text-sm">
                          Quick View
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-dark-400 text-sm ml-2">(24)</span>
                      </div>

                      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary-300 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      
                      <p className="text-dark-400 text-sm line-clamp-2 mb-4">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-xl">
                            {formatPrice(product.price)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-dark-500 line-through text-sm">
                              {formatPrice(product.compare_at_price)}
                            </span>
                          )}
                        </div>
                        
                        {product.stock_quantity > 0 ? (
                          <span className="text-green-400 text-sm">In Stock</span>
                        ) : (
                          <span className="text-red-400 text-sm">Out of Stock</span>
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
