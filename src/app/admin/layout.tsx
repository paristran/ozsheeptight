'use client'

import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
