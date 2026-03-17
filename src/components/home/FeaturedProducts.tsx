'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Package, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types/database'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

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

  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <span className="text-primary-500 font-semibold text-lg flex items-center gap-2 mb-2">
              ⭐ Featured Products
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Handpicked Favorites
            </h2>
            <p className="text-slate-500 text-lg max-w-xl">
              Loved by parents everywhere 💕
            </p>
          </div>
          <Link href="/products?featured=true">
            <Button variant="ghost" className="mt-4 md:mt-0 group text-primary-600 hover:text-primary-700 hover:bg-primary-50">
              View All
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-light-200 rounded-t-3xl" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-light-200 rounded-full w-1/2" />
                  <div className="h-6 bg-light-200 rounded-full w-3/4" />
                  <div className="h-4 bg-light-200 rounded-full w-full" />
                  <div className="h-6 bg-light-200 rounded-full w-1/3" />
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
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
              <Package className="h-10 w-10 text-primary-400" />
            </div>
            <h3 className="text-slate-800 text-xl font-semibold mb-2">No featured products yet</h3>
            <p className="text-slate-500 mb-6">Check back soon for our curated selection! 🌟</p>
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
                      
                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-gradient-to-r from-secondary-300 to-secondary-400 text-slate-800 text-sm font-semibold shadow-soft">
                          ⭐ Featured
                        </div>
                      )}

                      {/* Sale Badge */}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <div className="absolute top-4 right-14 px-3 py-1.5 rounded-full bg-gradient-to-r from-coral-400 to-coral-500 text-white text-sm font-semibold shadow-soft">
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

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                        <span className="px-6 py-3 rounded-2xl bg-white text-slate-800 font-semibold text-sm shadow-soft">
                          👀 Quick View
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-white">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
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
                          <span className="text-accent-600 text-sm font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-accent-400"></span>
                            In Stock
                          </span>
                        ) : (
                          <span className="text-coral-500 text-sm font-medium">Out of Stock</span>
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
