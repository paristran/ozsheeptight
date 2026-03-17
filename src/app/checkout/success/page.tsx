'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg mx-auto px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center shadow-lg"
        >
          <CheckCircle2 className="h-12 w-12 text-white" />
        </motion.div>

        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Order Confirmed! 🎉
        </h1>
        <p className="text-slate-600 text-lg mb-2">
          Thank you for your purchase!
        </p>
        <p className="text-slate-500 mb-8">
          We&apos;ll send you an email with your order details and tracking information.
        </p>

        {sessionId && (
          <p className="text-slate-400 text-sm mb-8">
            Order ID: {sessionId.slice(0, 20)}...
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg">
              Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="secondary">
              <Package className="mr-2 h-5 w-5" />
              Back Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-4xl animate-bounce">🐑</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
