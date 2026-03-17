'use client'

import { Hero } from '@/components/home/Hero'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Categories } from '@/components/home/Categories'
import { motion } from 'framer-motion'
import { Truck, Shield, Heart, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'

// Mock data - in production, this would come from Supabase
const mockProducts = [
  {
    id: '1',
    title: 'Premium Merino Wool Blanket',
    slug: 'premium-merino-wool-blanket',
    description: 'Ultra-soft merino wool blanket perfect for newborns. Temperature regulating and naturally hypoallergenic.',
    price: 149.99,
    compare_at_price: 199.99,
    category_id: '1',
    image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
    images: [],
    stock_quantity: 25,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Organic Cotton Sleep Sack',
    slug: 'organic-cotton-sleep-sack',
    description: 'GOTS certified organic cotton sleep sack. Safe, cozy, and perfect for peaceful sleep.',
    price: 79.99,
    compare_at_price: null,
    category_id: '2',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    images: [],
    stock_quantity: 40,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Luxury Baby Gift Set',
    slug: 'luxury-baby-gift-set',
    description: 'Curated gift set including premium onesies, booties, and a cuddly sheep toy.',
    price: 199.99,
    compare_at_price: 249.99,
    category_id: '3',
    image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800',
    images: [],
    stock_quantity: 15,
    featured: true,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockCategories = [
  {
    id: '1',
    name: 'Bedding & Blankets',
    slug: 'bedding-blankets',
    description: 'Cozy blankets and bedding essentials',
    image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sleepwear',
    slug: 'sleepwear',
    description: 'Comfortable sleep solutions for baby',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Gift Sets',
    slug: 'gift-sets',
    description: 'Thoughtfully curated gift collections',
    image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800',
    created_at: new Date().toISOString(),
  },
]

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $99',
    emoji: '🚚',
    color: 'from-primary-100 to-primary-50 border-primary-200',
    iconColor: 'text-primary-500',
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: 'Premium materials only',
    emoji: '🛡️',
    color: 'from-accent-100 to-accent-50 border-accent-200',
    iconColor: 'text-accent-500',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Handcrafted with care',
    emoji: '💖',
    color: 'from-pink-100 to-pink-50 border-pink-200',
    iconColor: 'text-pink-500',
  },
  {
    icon: Sparkles,
    title: 'Eco-Friendly',
    description: 'Sustainable materials',
    emoji: '🌿',
    color: 'from-accent-100 to-accent-50 border-accent-200',
    iconColor: 'text-accent-500',
  },
]

export default function Home() {
  return (
    <>
      <Hero />
      
      <FeaturedProducts />
      
      <Categories />

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-accent-500 font-semibold text-lg flex items-center justify-center gap-2 mb-2">
              ✨ Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              We Care About Your Little Ones
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-6 rounded-3xl bg-gradient-to-br border-2 transition-all duration-300"
              >
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h3 className="text-slate-800 font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-secondary-500 font-semibold text-lg flex items-center justify-center gap-2 mb-2">
              💬 Happy Parents
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              What Parents Are Saying
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', text: 'The softest blankets ever! My baby sleeps so peacefully. 💤', rating: 5 },
              { name: 'David L.', text: 'Amazing quality and fast shipping. Will definitely buy again! ⭐', rating: 5 },
              { name: 'Emily R.', text: 'Love the eco-friendly materials. Perfect for our little one! 🌿', rating: 5 },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-3xl bg-white border-2 border-light-200 shadow-soft"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-secondary-400 fill-secondary-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">{testimonial.text}</p>
                <p className="text-slate-800 font-semibold">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-400 via-purple-400 to-pink-400 p-12 md:p-20"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 text-4xl opacity-50">🌟</div>
            <div className="absolute top-8 right-8 text-5xl opacity-50">🐑</div>
            <div className="absolute bottom-8 left-12 text-4xl opacity-50">💕</div>
            <div className="absolute bottom-4 right-4 text-5xl opacity-50">🧸</div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Ready to Shop? 🛍️
              </h2>
              <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8 drop-shadow">
                Join thousands of happy parents who trust OzSheepTight for their baby's comfort.
              </p>
              <Link href="/products">
                <button className="px-10 py-4 rounded-2xl bg-white text-primary-600 font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-soft-lg hover:shadow-xl">
                  Start Shopping 🎉
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
