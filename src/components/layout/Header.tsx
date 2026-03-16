'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-2xl bg-dark-950/80 border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"
              >
                OzSheepTight
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-dark-200 hover:text-white transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="text-dark-200 hover:text-white transition-colors text-sm font-medium"
              >
                Products
              </Link>
              <Link 
                href="/products?featured=true" 
                className="text-dark-200 hover:text-white transition-colors text-sm font-medium"
              >
                Featured
              </Link>
              <Link 
                href="/about" 
                className="text-dark-200 hover:text-white transition-colors text-sm font-medium"
              >
                About
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-dark-300 hover:text-white"
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-16 w-80 p-4 rounded-2xl bg-dark-900/95 backdrop-blur-xl border border-dark-700/50 shadow-2xl"
                  >
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700/50 text-white placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      autoFocus
                    />
                  </motion.div>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative text-dark-300 hover:text-white">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                    0
                  </span>
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-dark-300 hover:text-white"
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
              className="md:hidden py-6 space-y-4"
            >
              <Link 
                href="/" 
                className="block text-dark-200 hover:text-white transition-colors text-base font-medium"
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="block text-dark-200 hover:text-white transition-colors text-base font-medium"
              >
                Products
              </Link>
              <Link 
                href="/products?featured=true" 
                className="block text-dark-200 hover:text-white transition-colors text-base font-medium"
              >
                Featured
              </Link>
              <Link 
                href="/about" 
                className="block text-dark-200 hover:text-white transition-colors text-base font-medium"
              >
                About
              </Link>
            </motion.nav>
          )}
        </div>
      </div>
    </header>
  )
}
