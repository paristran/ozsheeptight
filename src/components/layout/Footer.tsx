'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary-50 via-white to-purple-50 border-t border-light-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2"
            >
              <span className="text-3xl">🐑</span>
              <span className="text-2xl font-bold text-rainbow">
                OzSheepTight
              </span>
            </motion.div>
            <p className="text-slate-500 text-base leading-relaxed">
              Premium baby products crafted with love and care for your little ones. Making parenting easier, one cozy product at a time! 💕
            </p>
            <div className="flex gap-3">
              <span className="text-2xl hover:scale-125 transition-transform cursor-pointer">📘</span>
              <span className="text-2xl hover:scale-125 transition-transform cursor-pointer">📸</span>
              <span className="text-2xl hover:scale-125 transition-transform cursor-pointer">🐦</span>
              <span className="text-2xl hover:scale-125 transition-transform cursor-pointer">📌</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              🔗 Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-slate-500 hover:text-primary-600 hover:pl-1 text-base transition-all duration-200 flex items-center gap-2">
                  <span>→</span> All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-slate-500 hover:text-secondary-600 hover:pl-1 text-base transition-all duration-200 flex items-center gap-2">
                  <span>→</span> Featured Items
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-500 hover:text-accent-600 hover:pl-1 text-base transition-all duration-200 flex items-center gap-2">
                  <span>→</span> About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-500 hover:text-purple-600 hover:pl-1 text-base transition-all duration-200 flex items-center gap-2">
                  <span>→</span> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              💬 Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shipping" className="text-slate-500 hover:text-primary-600 hover:pl-1 text-base transition-all duration-200 flex items-center gap-2">
                  <span>→</span> Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-slate-500 hover:text-accent-600 hover:pl-1 text-base transition-all duration-200 flex items-center gap-2">
                  <span>→</span> Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-500 hover:text-secondary-600 hover:pl-1 text-base transition-all duration-200 flex items-center gap-2">
                  <span>→</span> FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-500 hover:text-slate-600 hover:pl-1 text-base transition-all duration-200 flex items-center gap-2">
                  <span>→</span> Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📧 Stay Updated
            </h3>
            <p className="text-slate-500 text-base mb-4">
              Subscribe for special offers and cute baby tips! ✨
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-light-300 text-slate-700 placeholder:text-slate-400 text-base focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold text-base hover:from-primary-500 hover:to-primary-600 transition-all shadow-soft hover:shadow-glow-blue hover:scale-105 active:scale-95"
              >
                Subscribe 🎉
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-light-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-base">
            © {new Date().getFullYear()} OzSheepTight. Made with 💖 for little ones.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-slate-400 hover:text-primary-600 text-base transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-primary-600 text-base transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
