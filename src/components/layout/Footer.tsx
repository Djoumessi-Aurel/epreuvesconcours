import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <BookOpen className="h-5 w-5" />
            <span>Site Épreuves</span>
          </div>

          <p className="text-center text-sm text-gray-600">
            Plateforme de partage d&apos;épreuves de concours africains — Cameroun et sous-région
          </p>

          <div className="flex gap-5 text-sm text-gray-600">
            <Link href="/contribuer" className="hover:text-gray-900 transition-colors">
              Contribuer
            </Link>
            <Link href="/connexion" className="hover:text-gray-900 transition-colors">
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
