'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  ArrowRight,
  CreditCard,
  Shield,
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
  })

  const shipping = total > 100 ? 0 : 9.99
  const grandTotal = total + shipping

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.postcode) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            title: item.variant_title ? `${item.title} - ${item.variant_title}` : item.title,
            price: item.variant_price !== undefined ? item.variant_price : item.price,
            quantity: item.quantity,
          })),
          customer: form,
        }),
      })

      const data = await res.json()

      if (data.url) {
        clearCart()
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h1>
          <Button onClick={() => router.push('/products')}>
            Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30">
      <div className="py-12 bg-gradient-to-r from-primary-50 via-white to-purple-50 border-b border-light-200">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center shadow-soft">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Checkout 💳</h1>
              <p className="text-slate-500">Secure payment powered by Stripe</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 border-2 border-light-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    👤 Your Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-600 text-sm font-medium mb-2 block">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          name="name"
                          placeholder="Jane Smith"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-600 text-sm font-medium mb-2 block">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          name="email"
                          type="email"
                          placeholder="jane@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-slate-600 text-sm font-medium mb-2 block">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          name="phone"
                          type="tel"
                          placeholder="04XX XXX XXX"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-6 border-2 border-light-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    📍 Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-slate-600 text-sm font-medium mb-2 block">Street Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          name="address"
                          placeholder="123 Baby Street"
                          value={form.address}
                          onChange={handleChange}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-600 text-sm font-medium mb-2 block">City *</label>
                      <Input
                        name="city"
                        placeholder="Sydney"
                        value={form.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-600 text-sm font-medium mb-2 block">State *</label>
                        <Input
                          name="state"
                          placeholder="NSW"
                          value={form.state}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 text-sm font-medium mb-2 block">Postcode *</label>
                        <Input
                          name="postcode"
                          placeholder="2000"
                          value={form.postcode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
                <Card className="p-6 border-2 border-light-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    📋 Order Summary
                  </h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-primary-50 to-purple-50">
                          {item.image_url ? (
                            <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">🐑</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 font-medium text-sm truncate">
                            {item.title}{item.variant_title ? ` — ${item.variant_title}` : ''}
                          </p>
                          <p className="text-slate-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-slate-800 font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 pt-4 border-t border-light-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping
                      </span>
                      <span className="font-medium">{shipping === 0 ? 'Free! 🎉' : formatPrice(shipping)}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-light-200">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-600 font-medium">Total</span>
                      <span className="text-2xl font-bold text-slate-800">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 rounded-2xl bg-coral-50 border border-coral-200 text-coral-600 text-sm">
                      ❌ {error}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full mt-6" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay {formatPrice(grandTotal)}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-4 pt-6 mt-6 border-t border-light-200">
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Shield className="h-4 w-4" />
                      Secure Payment
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Truck className="h-4 w-4" />
                      AU Shipping
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
