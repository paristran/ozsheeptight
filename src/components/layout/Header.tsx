'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Search, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-xl bg-white/90 border-b border-light-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl">🐑</span>
                <span className="text-2xl font-bold text-rainbow">
                  OzSheepTight
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link 
                href="/" 
                className="px-4 py-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 text-base font-medium animated-underline"
              >
                🏠 Home
              </Link>
              <Link 
                href="/products" 
                className="px-4 py-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 text-base font-medium animated-underline"
              >
                🛍️ Products
              </Link>
              <Link 
                href="/products?featured=true" 
                className="px-4 py-2 text-slate-600 hover:text-secondary-600 hover:bg-secondary-50 rounded-xl transition-all duration-200 text-base font-medium animated-underline"
              >
                ⭐ Featured
              </Link>
              <Link 
                href="/about" 
                className="px-4 py-2 text-slate-600 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all duration-200 text-base font-medium animated-underline"
              >
                💚 About
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-2xl"
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-16 w-80 p-4 rounded-3xl bg-white border border-light-200 shadow-soft-lg"
                  >
                    <input
                      type="text"
                      placeholder="🔍 Search products..."
                      className="w-full px-4 py-3 rounded-2xl bg-light-50 border-2 border-light-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all"
                      autoFocus
                    />
                  </motion.div>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-2xl">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-coral-400 to-coral-500 text-white text-xs flex items-center justify-center font-bold shadow-lg">
                    0
                  </span>
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-2xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 space-y-2"
            >
              <Link 
                href="/" 
                className="block px-4 py-3 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all text-base font-medium"
              >
                🏠 Home
              </Link>
              <Link 
                href="/products" 
                className="block px-4 py-3 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all text-base font-medium"
              >
                🛍️ Products
              </Link>
              <Link 
                href="/products?featured=true" 
                className="block px-4 py-3 text-slate-600 hover:text-secondary-600 hover:bg-secondary-50 rounded-2xl transition-all text-base font-medium"
              >
                ⭐ Featured
              </Link>
              <Link 
                href="/about" 
                className="block px-4 py-3 text-slate-600 hover:text-accent-600 hover:bg-accent-50 rounded-2xl transition-all text-base font-medium"
              >
                💚 About
              </Link>
            </motion.nav>
          )}
        </div>
      </div>
    </header>
  )
}
