'use client'

import { Hero } from '@/components/home/Hero'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Categories } from '@/components/home/Categories'
import { motion } from 'framer-motion'
import { Truck, Shield, Heart, Sparkles } from 'lucide-react'

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
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: 'Premium materials only',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Handcrafted with care',
  },
  {
    icon: Sparkles,
    title: 'Eco-Friendly',
    description: 'Sustainable materials',
  },
]

export default function Home() {
  return (
    <>
      <Hero />
      
      <FeaturedProducts products={mockProducts} />
      
      <Categories categories={mockCategories} />

      {/* Features Section */}
      <section className="py-24 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/30 mb-4">
                  <feature.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600/20 via-primary-500/10 to-secondary-500/20 border border-primary-500/30 p-12 md:p-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.2),transparent_50%)]" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Shop?
              </h2>
              <p className="text-dark-300 text-lg max-w-2xl mx-auto mb-8">
                Join thousands of happy parents who trust OzSheepTight for their baby's comfort.
              </p>
              <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-lg hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25">
                Start Shopping
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
