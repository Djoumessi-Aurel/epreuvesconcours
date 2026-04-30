import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// Le middleware (middleware.ts) protège déjà ces routes.
// Ce layout n'a pas besoin de vérifier l'auth — il reste statique.
export default function MembreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-gray-100" />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
