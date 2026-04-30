import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { VisiteTracker } from '@/components/layout/VisiteTracker'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <VisiteTracker />
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start">
        <main className="min-w-0 flex-1">{children}</main>

        <aside className="w-full lg:w-64 lg:shrink-0">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-gray-100" />}>
            <Sidebar />
          </Suspense>
        </aside>
      </div>

      <Footer />
    </div>
  )
}
