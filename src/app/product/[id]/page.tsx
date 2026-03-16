// @ts-nocheck
'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Star, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronRight,
  Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/lib/types/database'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [resolvedParams.id])

  async function fetchProduct() {
    const supabase = createClient()
    
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', resolvedParams.id)
      .single()

    if (productData) {
      setProduct(productData)
      
      // Fetch category
      if (productData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', productData.category_id)
          .single()
        setCategory(categoryData)
        
        // Fetch related products
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', productData.category_id)
          .neq('id', productData.id)
          .eq('active', true)
          .limit(4)
        setRelatedProducts(relatedData || [])
      }
    }
    
    setLoading(false)
  }

  const handleAddToCart = () => {
    // In a real app, this would add to a cart context or state
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(q => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-dark-800 rounded-3xl" />
            <div className="space-y-6">
              <div className="h-8 bg-dark-800 rounded w-1/3" />
              <div className="h-12 bg-dark-800 rounded w-3/4" />
              <div className="h-6 bg-dark-800 rounded w-1/4" />
              <div className="h-32 bg-dark-800 rounded" />
              <div className="h-12 bg-dark-800 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images || (product.image_url ? [product.image_url] : [])

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
            {category && (
              <>
                <ChevronRight className="h-4 w-4 text-dark-600" />
                <Link 
                  href={`/category/${category.id}`}
                  className="text-dark-400 hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-dark-600" />
            <span className="text-white">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <Card glass className="relative aspect-square overflow-hidden">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                  <span className="text-dark-500 text-lg">No image available</span>
                </div>
              )}
              
              {product.featured && (
                <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg">
                  Featured
                </div>
              )}

              {product.compare_at_price && product.compare_at_price > product.price && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium">
                  Save {Math.round((1 - product.price / product.compare_at_price) * 100)}%
                </div>
              )}
            </Card>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-500'
                        : 'border-dark-700/50 hover:border-dark-600'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category Badge */}
            {category && (
              <Link href={`/category/${category.id}`}>
                <Badge variant="secondary" className="hover:bg-dark-700 transition-colors">
                  {category.name}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-dark-400">
                4.9 (128 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-2xl text-dark-500 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-dark-300 text-lg leading-relaxed">
              {product.description || 'No description available.'}
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-green-400">
                    In Stock ({product.stock_quantity} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-red-400">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-6">
              <span className="text-dark-300">Quantity:</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl bg-dark-800/50 border border-dark-700/50 flex items-center justify-center text-white hover:bg-dark-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-white font-medium text-lg">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock_quantity}
                  className="w-10 h-10 rounded-xl bg-dark-800/50 border border-dark-700/50 flex items-center justify-center text-white hover:bg-dark-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || addedToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button size="lg" variant="secondary">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-dark-700/30">
              <div className="text-center p-4">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary-400" />
                <span className="text-dark-300 text-sm">Free Shipping</span>
              </div>
              <div className="text-center p-4">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary-400" />
                <span className="text-dark-300 text-sm">2 Year Warranty</span>
              </div>
              <div className="text-center p-4">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary-400" />
                <span className="text-dark-300 text-sm">30 Day Returns</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-24"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">You May Also Like</h2>
              <Link href={`/category/${category?.id}`}>
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link href={`/product/${relatedProduct.id}`}>
                    <Card glass className="group overflow-hidden hover:border-primary-500/50 transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden">
                        {relatedProduct.image_url ? (
                          <Image
                            src={relatedProduct.image_url}
                            alt={relatedProduct.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-medium mb-2 group-hover:text-primary-300 transition-colors line-clamp-1">
                          {relatedProduct.title}
                        </h3>
                        <span className="text-white font-bold">
                          {formatPrice(relatedProduct.price)}
                        </span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}
