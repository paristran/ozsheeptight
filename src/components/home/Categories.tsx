'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, FolderTree } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types/database'
import { Card } from '@/components/ui/card'

// Category icons/emojis mapping
const categoryIcons: Record<string, string> = {
  'bedding-blankets': '🛏️',
  'sleepwear': ' pajamas',
  'gift-sets': '🎁',
  'toys': '🧸',
  'clothing': '👶',
  'accessories': '🎀',
  'default': '📦',
}

export function Categories() {
  const [categories, setCategories] = useState<(Category & { product_count?: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('name')
    
    if (data) {
      const categoriesWithCount = data.map(cat => ({
        ...cat,
        product_count: cat.products?.[0]?.count || 0,
      }))
      setCategories(categoriesWithCount)
    }
    setLoading(false)
  }

  // Get emoji for category
  const getCategoryEmoji = (slug: string) => {
    return categoryIcons[slug] || categoryIcons['default']
  }

  // Color variations for category cards
  const cardColors = [
    { bg: 'from-primary-100 to-primary-50', border: 'border-primary-200', text: 'text-primary-600', hover: 'hover:border-primary-300' },
    { bg: 'from-secondary-100 to-secondary-50', border: 'border-secondary-200', text: 'text-secondary-600', hover: 'hover:border-secondary-300' },
    { bg: 'from-accent-100 to-accent-50', border: 'border-accent-200', text: 'text-accent-600', hover: 'hover:border-accent-300' },
    { bg: 'from-purple-100 to-purple-50', border: 'border-purple-200', text: 'text-purple-600', hover: 'hover:border-purple-300' },
    { bg: 'from-pink-100 to-pink-50', border: 'border-pink-200', text: 'text-pink-600', hover: 'hover:border-pink-300' },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-primary-50/30 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-purple-500 font-semibold text-lg flex items-center justify-center gap-2 mb-2">
            📂 Shop by Category
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Find What You Need
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Browse our collections to find the perfect items for your little one! 🌈
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse aspect-[4/3] bg-light-200" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <FolderTree className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-slate-800 text-xl font-semibold mb-2">No categories yet</h3>
            <p className="text-slate-500">Categories will appear here once added. 📦</p>
          </motion.div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const colorScheme = cardColors[index % cardColors.length]
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/category/${category.id}`}>
                    <Card className={`group relative overflow-hidden aspect-[4/3] border-2 ${colorScheme.border} ${colorScheme.hover} transition-all duration-300`}>
                      {/* Background */}
                      <div className="absolute inset-0">
                        {category.image_url ? (
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.bg}`} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
                      </div>

                      {/* Floating emoji */}
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-4 right-4 text-4xl opacity-80"
                      >
                        {getCategoryEmoji(category.slug)}
                      </motion.div>

                      {/* Content */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <h3 className="text-white font-bold text-2xl mb-2 group-hover:text-secondary-200 transition-colors drop-shadow-lg">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-white/80 text-sm mb-4 line-clamp-2 drop-shadow">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-white font-medium group-hover:text-secondary-200 transition-colors">
                            <span>Explore</span>
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                          </div>
                          {category.product_count !== undefined && (
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                              {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
