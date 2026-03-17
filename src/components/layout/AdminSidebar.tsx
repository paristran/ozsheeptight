'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart,
  Settings,
  Store,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, emoji: '📊' },
  { name: 'Products', href: '/admin/products', icon: Package, emoji: '📦' },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree, emoji: '📂' },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, emoji: '🛒' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, emoji: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-50 to-white border-r-2 border-light-200 shadow-soft">
      <div className="p-6">
        {/* Logo */}
        <Link href="/admin" className="flex items-center space-x-3 mb-8 group">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-400 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-800 font-bold text-lg">Admin</h1>
            <p className="text-slate-400 text-xs">OzSheepTight</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 border-2 border-primary-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-light-50 border-2 border-transparent'
                  )}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Back to Store */}
        <div className="mt-8 pt-8 border-t-2 border-light-200">
          <Link href="/">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border-2 border-transparent hover:border-primary-200"
            >
              <span className="text-xl">🏪</span>
              <span className="text-sm font-medium">View Store</span>
            </motion.div>
          </Link>
          
          <button
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-coral-500 hover:text-coral-600 hover:bg-coral-50 transition-all duration-200 mt-2 border-2 border-transparent hover:border-coral-200"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
