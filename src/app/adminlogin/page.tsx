'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Lock, User, ArrowRight, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInAsAdmin, isAdmin } = useAuth()
  const router = useRouter()

  if (isAdmin) {
    router.push('/admin')
    return null
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (signInAsAdmin(username, password)) {
      router.push('/admin')
    } else {
      setError('Invalid admin credentials')
    }
    setLoading(false)
  }

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
            🔐
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Login</h1>
          <p className="text-slate-500 mt-2">Access the admin dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-coral-50 border border-coral-200 text-coral-600 text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <Card className="p-8 border-2 border-light-200">
          <div className="flex items-center gap-2 mb-6 p-3 rounded-2xl bg-primary-50">
            <Shield className="h-5 w-5 text-primary-500" />
            <span className="text-primary-700 text-sm font-medium">Authorized personnel only</span>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="text-slate-600 text-sm font-medium mb-2 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="text-slate-600 text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-5 w-5" />
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back to Store
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
