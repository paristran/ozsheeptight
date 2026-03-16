'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, FolderTree } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types/database'
import { Card } from '@/components/ui/card'

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

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Shop by Category
          </h2>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            Find exactly what you need for your little one
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse aspect-[4/3] bg-dark-800" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-800/50 flex items-center justify-center">
              <FolderTree className="h-8 w-8 text-dark-500" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">No categories yet</h3>
            <p className="text-dark-400">Categories will appear here once added.</p>
          </motion.div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/category/${category.id}`}>
                  <Card glass className="group relative overflow-hidden aspect-[4/3] border-dark-700/30 hover:border-primary-500/50 transition-all duration-300">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-secondary-500/30" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-white font-bold text-2xl mb-2 group-hover:text-primary-300 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary-400 text-sm font-medium group-hover:text-primary-300 transition-colors">
                          <span>Explore</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                        {category.product_count !== undefined && (
                          <span className="text-dark-400 text-sm">
                            {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
                          </span>
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
