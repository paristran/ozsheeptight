'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Package, 
  FolderTree, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
  Circle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Stats {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalRevenue: number
  recentOrders: number
  ordersChange: number
  revenueChange: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: 0,
    ordersChange: 0,
    revenueChange: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const supabase = createClient()
    
    const [productsRes, categoriesRes, ordersRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('categories').select('id', { count: 'exact' }),
      supabase.from('orders').select('total, created_at'),
    ])

    const totalProducts = productsRes.count || 0
    const totalCategories = categoriesRes.count || 0
    const totalOrders = ordersRes.data?.length || 0
    const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + o.total, 0) || 0
    
    // Calculate recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentOrders = ordersRes.data?.filter(
      o => new Date(o.created_at) > sevenDaysAgo
    ).length || 0

    setStats({
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      recentOrders,
      ordersChange: 12.5, // Mock percentage change
      revenueChange: 8.3,
    })
    setLoading(false)
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      href: '/admin/products',
      gradient: 'from-primary-400 to-primary-500',
      bg: 'bg-primary-50',
      emoji: '📦',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: FolderTree,
      href: '/admin/categories',
      gradient: 'from-purple-400 to-purple-500',
      bg: 'bg-purple-50',
      emoji: '📂',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      href: '/admin/orders',
      gradient: 'from-accent-400 to-accent-500',
      bg: 'bg-accent-50',
      emoji: '🛒',
      change: stats.ordersChange,
    },
    {
      title: 'Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      href: '/admin/orders',
      gradient: 'from-secondary-400 to-secondary-500',
      bg: 'bg-secondary-50',
      emoji: '💰',
      change: stats.revenueChange,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard 📊</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent-50 border-2 border-accent-200">
            <Sparkles className="h-4 w-4 text-accent-500" />
            <span className="text-accent-600 text-sm font-semibold">Store Active</span>
            <span className="text-lg">✅</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="p-6 border-2 border-transparent hover:border-primary-200 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <span className="text-2xl">{stat.emoji}</span>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {loading ? '...' : stat.value}
                  </p>
                </div>

                {stat.change !== undefined && (
                  <div className="flex items-center gap-1 mt-3">
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-accent-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-coral-500" />
                    )}
                    <span className={stat.change >= 0 ? 'text-accent-600 text-sm font-medium' : 'text-coral-500 text-sm font-medium'}>
                      {stat.change >= 0 ? '+' : ''}{stat.change}%
                    </span>
                    <span className="text-slate-400 text-sm">vs last week</span>
                  </div>
                )}
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 border-2 border-light-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/products/new">
              <Button variant="secondary" className="w-full justify-start hover:border-primary-200">
                <span className="mr-2">📦</span>
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="secondary" className="w-full justify-start hover:border-purple-200">
                <span className="mr-2">📂</span>
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="secondary" className="w-full justify-start hover:border-accent-200">
                <span className="mr-2">🛒</span>
                View Orders
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-2 border-light-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              📈 Store Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary-50 border-2 border-primary-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="text-slate-800 font-semibold">Active Products</p>
                    <p className="text-slate-500 text-sm">Ready for sale</p>
                  </div>
                </div>
                <span className="text-slate-800 font-bold text-xl">{stats.totalProducts}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-accent-50 border-2 border-accent-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <p className="text-slate-800 font-semibold">Recent Orders</p>
                    <p className="text-slate-500 text-sm">Last 7 days</p>
                  </div>
                </div>
                <span className="text-slate-800 font-bold text-xl">{stats.recentOrders}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary-50 border-2 border-secondary-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-slate-800 font-semibold">Total Revenue</p>
                    <p className="text-slate-500 text-sm">All time</p>
                  </div>
                </div>
                <span className="text-slate-800 font-bold text-xl">{formatPrice(stats.totalRevenue)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 border-2 border-light-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              🚀 Getting Started
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-accent-50 border-2 border-accent-100">
                <div className="w-8 h-8 rounded-full bg-accent-400 flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <span className="text-slate-600">Set up your store</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-accent-50 border-2 border-accent-100">
                <div className="w-8 h-8 rounded-full bg-accent-400 flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
                <span className="text-slate-600">Add categories</span>
              </div>
              
              <Link href="/admin/products/new">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50 border-2 border-primary-100 hover:bg-primary-100 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <span className="text-slate-700 font-medium group-hover:text-primary-700">Add your first product</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-primary-500" />
                </div>
              </Link>
              
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-light-50 border-2 border-light-200">
                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-500 text-sm font-bold">
                  4
                </div>
                <span className="text-slate-400">Configure payment settings</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
