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
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-dark-950/50 backdrop-blur-xl border-r border-dark-700/30">
      <div className="p-6">
        {/* Logo */}
        <Link href="/admin" className="flex items-center space-x-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Admin</h1>
            <p className="text-dark-400 text-xs">OzSheepTight</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-white border border-primary-500/30'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Back to Store */}
        <div className="mt-8 pt-8 border-t border-dark-700/30">
          <Link href="/">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all duration-200"
            >
              <Store className="h-5 w-5" />
              <span className="text-sm font-medium">View Store</span>
            </motion.div>
          </Link>
          
          <button
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 mt-2"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
