'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        router.push('/')
      }
    })

    // Exchange code for session
    supabase.auth.exchangeCodeForSession(window.location.href.split('?')[1] || '')
      .then(() => router.push('/'))
      .catch(() => router.push('/login?error=auth_failed'))
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl animate-bounce mb-4">🐑</div>
        <h1 className="text-2xl font-bold text-slate-800">Signing you in...</h1>
        <p className="text-slate-500 mt-2">Please wait a moment ✨</p>
      </div>
    </div>
  )
}
