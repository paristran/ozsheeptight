// @ts-nocheck
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
  Sparkles
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
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: FolderTree,
      href: '/admin/categories',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-500/10',
      change: stats.ordersChange,
    },
    {
      title: 'Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      href: '/admin/orders',
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      change: stats.revenueChange,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30">
            <Sparkles className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Store Active</span>
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
              <Card glass className="p-6 hover:border-primary-500/50 transition-all duration-300 group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('purple') ? '#a855f7' : stat.color.includes('green') ? '#22c55e' : '#f59e0b' }} />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-dark-600 group-hover:text-primary-400 transition-colors" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-dark-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">
                    {loading ? '...' : stat.value}
                  </p>
                </div>

                {stat.change !== undefined && (
                  <div className="flex items-center gap-1 mt-3">
                    {stat.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={stat.change >= 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                      {stat.change >= 0 ? '+' : ''}{stat.change}%
                    </span>
                    <span className="text-dark-500 text-sm">vs last week</span>
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
        <Card glass className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/products/new">
              <Button variant="secondary" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="secondary" className="w-full justify-start">
                <FolderTree className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="secondary" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card glass className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Store Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Active Products</p>
                    <p className="text-dark-400 text-sm">Ready for sale</p>
                  </div>
                </div>
                <span className="text-white font-bold text-lg">{stats.totalProducts}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Recent Orders</p>
                    <p className="text-dark-400 text-sm">Last 7 days</p>
                  </div>
                </div>
                <span className="text-white font-bold text-lg">{stats.recentOrders}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Total Revenue</p>
                    <p className="text-dark-400 text-sm">All time</p>
                  </div>
                </div>
                <span className="text-white font-bold text-lg">{formatPrice(stats.totalRevenue)}</span>
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
          <Card glass className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-medium">
                  ✓
                </div>
                <span className="text-dark-300">Set up your store</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-medium">
                  ✓
                </div>
                <span className="text-dark-300">Add categories</span>
              </div>
              
              <Link href="/admin/products/new">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30 hover:bg-dark-800/50 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-sm font-medium">
                    3
                  </div>
                  <span className="text-dark-200">Add your first product</span>
                  <ArrowUpRight className="h-4 w-4 text-dark-500 ml-auto" />
                </div>
              </Link>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30">
                <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-dark-500 text-sm font-medium">
                  4
                </div>
                <span className="text-dark-400">Configure payment settings</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
