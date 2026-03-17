'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, Star, Grid3X3, LayoutList, ChevronDown, Heart, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/lib/types/database'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A-Z', value: 'name_asc' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('active', true)
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

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => 
        p.category_id && selectedCategories.includes(p.category_id)
      )
    }

    // Price filter
    filtered = filtered.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }

    return filtered
  }, [products, searchQuery, selectedCategories, sortBy, priceRange])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setPriceRange([0, 1000])
    setSortBy('newest')
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

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30">
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-white to-purple-100" />
        <div className="absolute inset-0 bg-fun-dots opacity-30" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="text-primary-500 font-semibold text-lg mb-2 block">🛍️ Our Collection</span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Shop All Products
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Explore our premium selection of baby products designed with love and care 💕
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none h-12 pl-4 pr-10 rounded-2xl border-2 border-light-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 cursor-pointer min-w-[180px]"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'default' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {/* View Mode */}
          <div className="hidden lg:flex items-center gap-2 bg-white rounded-2xl p-1.5 border-2 border-light-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutList className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`w-72 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <Card className="p-6 sticky top-24 border-2 border-light-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-800 font-bold text-lg">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-primary-500 text-sm hover:text-primary-600 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-slate-600 text-sm font-semibold mb-4 flex items-center gap-2">
                  📂 Categories
                </h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-light-50 transition-colors"
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedCategories.includes(category.id)
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-light-300 group-hover:border-primary-300'
                        }`}
                      >
                        {selectedCategories.includes(category.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-slate-600 text-sm group-hover:text-slate-800 transition-colors">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-slate-600 text-sm font-semibold mb-4 flex items-center gap-2">
                  💰 Price Range
                </h4>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0] || ''}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <span className="text-slate-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1] || ''}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-500 text-sm">
                Showing <span className="text-slate-800 font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-2 border-light-200">
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
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                  <Search className="h-10 w-10 text-primary-400" />
                </div>
                <h3 className="text-slate-800 text-xl font-semibold mb-2">No products found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or search query 🔍</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${viewMode}-${sortBy}-${selectedCategories.join('-')}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} viewMode={viewMode} favorites={favorites} toggleFavorite={toggleFavorite} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, viewMode, favorites, toggleFavorite }: { 
  product: Product; 
  viewMode: 'grid' | 'list';
  favorites: Set<string>;
  toggleFavorite: (productId: string, e: React.MouseEvent) => void;
}) {
  if (viewMode === 'list') {
    return (
      <Link href={`/product/${product.id}`}>
        <Card className="group flex overflow-hidden border-2 border-transparent hover:border-primary-200 transition-all duration-300">
          <div className="relative w-48 shrink-0 bg-gradient-to-br from-primary-50 to-purple-50">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🐑</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-6 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-slate-800 font-bold text-lg mb-2 group-hover:text-primary-600 transition-colors">
                  {product.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                  {product.description}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-secondary-400 fill-secondary-400" />
                  ))}
                  <span className="text-slate-400 text-sm ml-2">(24)</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-800 font-bold text-xl">
                  {formatPrice(product.price)}
                </div>
                {product.compare_at_price && (
                  <div className="text-slate-400 line-through text-sm">
                    {formatPrice(product.compare_at_price)}
                  </div>
                )}
                <Badge
                  variant={product.stock_quantity > 0 ? 'success' : 'destructive'}
                  className="mt-2"
                >
                  {product.stock_quantity > 0 ? '✓ In Stock' : 'Out of Stock'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden border-2 border-transparent hover:border-primary-200 transition-all duration-300 cursor-pointer">
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
  )
}
