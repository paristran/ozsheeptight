'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { LogIn, Lock } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAdmin) {
      router.push('/adminlogin')
    }
  }, [mounted, loading, isAdmin, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-50 via-blue-50/20 to-purple-50/20">
        <div className="text-4xl animate-bounce">🐑</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-50 via-blue-50/20 to-purple-50/20">
        <div className="text-center">
          <Lock className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Access Required 🔐</h1>
          <p className="text-slate-500 mb-6">Please sign in with your admin credentials</p>
          <Link href="/adminlogin">
            <Button size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-light-50 via-blue-50/20 to-purple-50/20">
      <AdminSidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
