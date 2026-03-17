'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { LogIn, ArrowRight, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function LoginForm() {
  const [error, setError] = useState('')
  const { signInWithGoogle, signInWithFacebook, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  if (user) {
    router.push('/')
    return null
  }

  const errorParam = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="inline-block text-6xl mb-4"
          >
            🐑
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome back!</h1>
          <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {(errorParam || error) && (
          <div className="mb-6 p-4 rounded-2xl bg-coral-50 border border-coral-200 text-coral-600 text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error || 'Authentication failed. Please try again.'}
          </div>
        )}

        {/* OAuth Buttons */}
        <Card className="p-6 border-2 border-light-200 mb-6">
          <div className="space-y-3">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={signInWithGoogle}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={signInWithFacebook}
            >
              <svg className="mr-2 h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </Button>
          </div>
        </Card>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-light-200" />
          <span className="text-slate-400 text-sm">or</span>
          <div className="flex-1 h-px bg-light-200" />
        </div>

        {/* Admin link */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => router.push('/adminlogin')} className="text-slate-400 hover:text-slate-600 text-sm">
            <Shield className="mr-2 h-4 w-4" />
            Admin? Sign in here
          </Button>
        </div>

        {/* Back */}
        <div className="text-center mt-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back to Store
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-4xl animate-bounce">🐑</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
