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
  Check,
  Gift,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart-context'
import { Product, Category, ProductVariant, VariantOption } from '@/lib/types/database'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchProduct()
  }, [resolvedParams.id])

  async function fetchProduct() {
    const supabase = createClient()
    
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .eq('id', resolvedParams.id)
      .single() as any

    if (productData) {
      setProduct(productData)
      
      // Fetch category
      if (productData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', productData.category_id)
          .single() as any
        setCategory(categoryData)
        
        // Fetch related products
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', productData.category_id)
          .neq('id', productData.id)
          .eq('active', true)
          .limit(4) as any
        setRelatedProducts(relatedData || [])
      }

      // Fetch variant options with values
      const { data: optionsData } = await supabase
        .from('variant_options')
        .select(`
          *,
          values:variant_values(*)
        `)
        .eq('product_id', productData.id)
        .order('position', { ascending: true }) as any
      
      if (optionsData && optionsData.length > 0) {
        setVariantOptions(optionsData)
        // Initialize selected values with first option of each
        const initialSelections: Record<string, string> = {}
        optionsData.forEach((opt: any) => {
          if (opt.values && opt.values.length > 0) {
            initialSelections[opt.id] = opt.values[0].id
          }
        })
        setSelectedValues(initialSelections)
      }

      // Fetch variants with value combinations
      const { data: variantsData } = await supabase
        .from('product_variants')
        .select(`
          *,
          value_combinations:variant_value_combinations(
            value_id,
            value:variant_values(*)
          )
        `)
        .eq('product_id', productData.id)
        .order('position', { ascending: true }) as any
      
      if (variantsData) {
        setVariants(variantsData)
      }
    }
    
    setLoading(false)
  }

  // Find matching variant based on selected values
  const selectedVariant = variants.find(variant => {
    if (!variant.value_combinations || variant.value_combinations.length === 0) return false
    const variantValueIds = variant.value_combinations.map((vc: any) => vc.value_id).sort()
    const selectedValueIds = Object.values(selectedValues).sort()
    return JSON.stringify(variantValueIds) === JSON.stringify(selectedValueIds)
  })

  // Determine current display values (variant or base product)
  const displayPrice = selectedVariant ? Number(selectedVariant.price) : (product ? Number(product.price) : 0)
  const displayComparePrice = selectedVariant 
    ? (selectedVariant.compare_at_price ? Number(selectedVariant.compare_at_price) : null)
    : (product?.compare_at_price ? Number(product.compare_at_price) : null)
  const displayStock = selectedVariant ? selectedVariant.stock_quantity : (product?.stock_quantity || 0)
  const displayImage = selectedVariant?.image_url || product?.image_url

  const { addItem } = useCart()

  const handleAddToCart = () => {
    if (!product) return
    
    if (selectedVariant) {
      // Add variant to cart
      addItem({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        image_url: selectedVariant.image_url || product.image_url,
        stock_quantity: selectedVariant.stock_quantity,
        quantity,
        variant_id: selectedVariant.id,
        variant_title: selectedVariant.title || undefined,
        variant_price: Number(selectedVariant.price),
      })
    } else {
      // Add base product to cart
      addItem({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        quantity,
      })
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const incrementQuantity = () => {
    if (quantity < displayStock) {
      setQuantity(q => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1)
    }
  }

  // Handle variant option selection
  const handleValueSelect = (optionId: string, valueId: string) => {
    setSelectedValues(prev => ({
      ...prev,
      [optionId]: valueId
    }))
  }

  // Color detection helper
  const isColorOption = (name: string) => {
    const colorKeywords = ['color', 'colour', 'colorway', 'farbe', 'couleur']
    return colorKeywords.some(keyword => name.toLowerCase().includes(keyword))
  }

  // Get color hex from value name
  const getColorHex = (value: string): string => {
    const colorMap: Record<string, string> = {
      'red': '#EF4444',
      'blue': '#3B82F6',
      'green': '#22C55E',
      'yellow': '#F59E0B',
      'purple': '#A855F7',
      'pink': '#EC4899',
      'orange': '#F97316',
      'black': '#1F2937',
      'white': '#F9FAFB',
      'gray': '#6B7280',
      'grey': '#6B7280',
      'navy': '#1E3A8A',
      'beige': '#D4B896',
      'brown': '#92400E',
      'tan': '#A3A086',
      'cream': '#FFF8DC',
      'gold': '#FFD700',
      'silver': '#C0C0C0',
    }
    const lowerValue = value.toLowerCase()
    for (const [name, hex] of Object.entries(colorMap)) {
      if (lowerValue.includes(name)) return hex
    }
    // Generate a hash color if not found
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash)
    }
    return `hsl(${hash % 360}, 70%, 60%)`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-light-200 rounded-3xl" />
            <div className="space-y-6">
              <div className="h-8 bg-light-200 rounded-full w-1/3" />
              <div className="h-12 bg-light-200 rounded-full w-3/4" />
              <div className="h-6 bg-light-200 rounded-full w-1/4" />
              <div className="h-32 bg-light-200 rounded-2xl" />
              <div className="h-12 bg-light-200 rounded-full w-1/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images || (product.image_url ? [product.image_url] : [])
  const hasVariants = variantOptions.length > 0 && variants.length > 0

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
            {category && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-300" />
                <Link 
                  href={`/category/${category.id}`}
                  className="text-slate-500 hover:text-primary-600 transition-colors"
                >
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="text-slate-800 font-medium">{product.title}</span>
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
            <Card className="relative aspect-square overflow-hidden border-2 border-light-200">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center">
                  <span className="text-8xl">🐑</span>
                </div>
              )}
              
              {product.featured && (
                <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-gradient-to-r from-secondary-300 to-secondary-400 text-slate-800 text-sm font-semibold shadow-soft">
                  ⭐ Featured
                </div>
              )}

              {displayComparePrice && displayComparePrice > displayPrice && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-gradient-to-r from-coral-400 to-coral-500 text-white text-sm font-semibold shadow-soft">
                  Save {Math.round((1 - displayPrice / displayComparePrice) * 100)}% 🎉
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
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-400 ring-4 ring-primary-100'
                        : 'border-light-200 hover:border-primary-200'
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
                <Badge variant="secondary" className="hover:bg-primary-100 hover:text-primary-700 transition-colors">
                  📂 {category.name}
                </Badge>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary-400 fill-secondary-400" />
                ))}
              </div>
              <span className="text-slate-500">
                4.9 (128 reviews) ⭐
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-slate-800">
                {formatPrice(displayPrice)}
              </span>
              {displayComparePrice && (
                <span className="text-2xl text-slate-400 line-through">
                  {formatPrice(displayComparePrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-600 text-lg leading-relaxed">
              {product.description || 'No description available.'}
            </p>

            {/* Variant Options */}
            {hasVariants && variantOptions.map((option) => (
              <div key={option.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-semibold">{option.name}:</span>
                  {option.values && option.values.find(v => v.id === selectedValues[option.id]) && (
                    <span className="text-slate-500">
                      {option.values.find(v => v.id === selectedValues[option.id])?.value}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {option.values && option.values.map((value) => {
                    const isSelected = selectedValues[option.id] === value.id
                    const colorHex = isColorOption(option.name) ? getColorHex(value.value) : null
                    
                    if (colorHex) {
                      // Color swatches
                      return (
                        <button
                          key={value.id}
                          onClick={() => handleValueSelect(option.id, value.id)}
                          className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'ring-4 ring-primary-200 border-primary-500 scale-110'
                              : 'border-light-300 hover:border-primary-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: colorHex }}
                          title={value.value}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className={`h-5 w-5 ${colorHex === '#F9FAFB' || colorHex === '#FFF8DC' ? 'text-slate-800' : 'text-white'}`} />
                            </div>
                          )}
                        </button>
                      )
                    } else {
                      // Size/other buttons
                      return (
                        <button
                          key={value.id}
                          onClick={() => handleValueSelect(option.id, value.id)}
                          className={`px-5 py-2.5 rounded-full border-2 font-medium transition-all ${
                            isSelected
                              ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                              : 'bg-white border-light-300 text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                          }`}
                        >
                          {value.value}
                        </button>
                      )
                    }
                  })}
                </div>
              </div>
            ))}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {displayStock > 0 ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-accent-400 animate-pulse" />
                  <span className="text-accent-600 font-medium">
                    ✓ In Stock ({displayStock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-coral-400" />
                  <span className="text-coral-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-6">
              <span className="text-slate-600 font-medium">Quantity:</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-2xl bg-light-100 border-2 border-light-200 flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-14 text-center text-slate-800 font-bold text-xl">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= displayStock}
                  className="w-12 h-12 rounded-2xl bg-light-100 border-2 border-light-200 flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={displayStock === 0 || addedToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Added to Cart! 🎉
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? 'bg-pink-50 border-pink-200 text-pink-600' : ''}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
              </Button>
              <Button size="lg" variant="secondary">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-light-200">
              <div className="text-center p-4 rounded-2xl bg-primary-50">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                <span className="text-slate-600 text-sm font-medium">Free Shipping</span>
              </div>
              <div className="text-center p-4 rounded-2xl bg-accent-50">
                <Shield className="h-6 w-6 mx-auto mb-2 text-accent-500" />
                <span className="text-slate-600 text-sm font-medium">2 Year Warranty</span>
              </div>
              <div className="text-center p-4 rounded-2xl bg-purple-50">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <span className="text-slate-600 text-sm font-medium">30 Day Returns</span>
              </div>
            </div>

            {/* Gift Wrap Option */}
            <Card className="p-4 border-2 border-light-200 bg-gradient-to-r from-secondary-50 to-white">
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-secondary-500" />
                <div>
                  <p className="text-slate-800 font-medium">Gift wrapping available! 🎁</p>
                  <p className="text-slate-500 text-sm">Add a personal message at checkout</p>
                </div>
              </div>
            </Card>
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
              <div>
                <span className="text-purple-500 font-semibold text-lg mb-2 block">✨ You May Also Like</span>
                <h2 className="text-3xl font-bold text-slate-800">Related Products</h2>
              </div>
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
                    <Card className="group overflow-hidden border-2 border-transparent hover:border-primary-200 transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-50 to-purple-50">
                        {relatedProduct.image_url ? (
                          <Image
                            src={relatedProduct.image_url}
                            alt={relatedProduct.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl">🐑</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white">
                        <h3 className="text-slate-800 font-medium mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {relatedProduct.title}
                        </h3>
                        <span className="text-slate-800 font-bold">
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
