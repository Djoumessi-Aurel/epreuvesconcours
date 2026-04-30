import { Suspense } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-bold text-blue-900 hover:text-blue-800 transition-colors"
      >
        <BookOpen className="h-7 w-7" />
        Site Épreuves
      </Link>
      <div className="w-full max-w-md">
        <Suspense>{children}</Suspense>
      </div>
      <p className="mt-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700 transition-colors">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  )
}
