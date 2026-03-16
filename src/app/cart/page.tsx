// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Minus, 
  Plus, 
  X, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag,
  CreditCard,
  Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types/database'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface CartItem {
  product: Product
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  useEffect(() => {
    // In a real app, this would come from a cart context/localStorage
    // For demo, we'll fetch some products
    fetchDemoProducts()
  }, [])

  async function fetchDemoProducts() {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .limit(3)
    
    if (data) {
      setCartItems(data.map(p => ({ product: p, quantity: 1 })))
    }
    setLoading(false)
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.product.stock_quantity))
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const removeItem = (productId: string) => {
    setCartItems(items => items.filter(item => item.product.id !== productId))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discount = promoApplied ? subtotal * 0.1 : 0
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal - discount + shipping

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'save10') {
      setPromoApplied(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-dark-800 rounded-2xl" />
              ))}
            </div>
            <div className="h-96 bg-dark-800 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="py-12 border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Shopping Cart
              </h1>
              <p className="text-dark-400">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-dark-800/50 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-dark-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
            <p className="text-dark-400 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Link href="/products">
              <Button size="lg">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card glass className="p-6 group">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <Link 
                          href={`/product/${item.product.id}`}
                          className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0"
                        >
                          {item.product.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20" />
                          )}
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link href={`/product/${item.product.id}`}>
                                <h3 className="text-white font-semibold text-lg hover:text-primary-300 transition-colors">
                                  {item.product.title}
                                </h3>
                              </Link>
                              <p className="text-dark-400 text-sm mt-1 line-clamp-1">
                                {item.product.description}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-dark-500 hover:text-red-400 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.product.id, -1)}
                                disabled={item.quantity <= 1}
                                className="w-9 h-9 rounded-lg bg-dark-800/50 border border-dark-700/50 flex items-center justify-center text-white hover:bg-dark-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center text-white font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, 1)}
                                disabled={item.quantity >= item.product.stock_quantity}
                                className="w-9 h-9 rounded-lg bg-dark-800/50 border border-dark-700/50 flex items-center justify-center text-white hover:bg-dark-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="text-white font-bold text-lg">
                                {formatPrice(item.product.price * item.quantity)}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-dark-500 text-sm">
                                  {formatPrice(item.product.price)} each
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue Shopping */}
              <Link href="/products">
                <Button variant="ghost" className="mt-4">
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <Card glass className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-white">Order Summary</h2>

                  {/* Promo Code */}
                  <div>
                    <label className="text-dark-300 text-sm mb-2 block">Promo Code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied}
                      />
                      <Button
                        variant="secondary"
                        onClick={applyPromoCode}
                        disabled={promoApplied || !promoCode}
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    {promoApplied && (
                      <p className="text-green-400 text-sm mt-2">
                        ✓ Promo code applied: 10% off
                      </p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-dark-700/30">
                    <div className="flex justify-between text-dark-300">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-dark-300">
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping
                      </span>
                      <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-dark-500 text-xs">
                        Free shipping on orders over $100
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-dark-700/30">
                    <div className="flex justify-between items-baseline">
                      <span className="text-dark-300">Total</span>
                      <span className="text-2xl font-bold text-white">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button size="lg" className="w-full">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Proceed to Checkout
                  </Button>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex items-center gap-1 text-dark-400 text-xs">
                      <Shield className="h-4 w-4" />
                      Secure Checkout
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
