// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types/database'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('featured', true)
      .eq('active', true)
      .limit(6)
    
    if (data) setProducts(data)
    setLoading(false)
  }

  return (
    <section className="py-24 bg-dark-950/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Featured Products
            </h2>
            <p className="text-dark-400 text-lg max-w-xl">
              Handpicked favorites loved by parents everywhere
            </p>
          </div>
          <Link href="/products?featured=true">
            <Button variant="ghost" className="mt-4 md:mt-0 group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-dark-800" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-dark-800 rounded w-1/2" />
                  <div className="h-6 bg-dark-800 rounded w-3/4" />
                  <div className="h-4 bg-dark-800 rounded w-full" />
                  <div className="h-6 bg-dark-800 rounded w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-800/50 flex items-center justify-center">
              <Package className="h-8 w-8 text-dark-500" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No featured products yet</h3>
            <p className="text-dark-400 mb-6">Check back soon for our curated selection!</p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </motion.div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/product/${product.id}`}>
                  <Card glass className="group overflow-hidden border-dark-700/30 hover:border-primary-500/50 transition-all duration-300">
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
                      
                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-medium shadow-lg">
                          Featured
                        </div>
                      )}

                      {/* Sale Badge */}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
                          -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
                        </div>
                      )}

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="px-6 py-3 rounded-xl bg-white text-dark-950 font-medium text-sm">
                          Quick View
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Rating */}
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
          </div>
        )}
      </div>
    </section>
  )
}
