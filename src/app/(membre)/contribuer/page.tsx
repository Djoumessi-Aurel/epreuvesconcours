import { connection } from 'next/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Upload, Info, LogIn, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ContribuerForm } from '@/components/contribuer/ContribuerForm'

export const metadata: Metadata = { title: 'Contribuer | Site Épreuves' }

export default async function ContribuerPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Contribuer</h1>
        <p className="mt-1 text-base text-gray-600">
          Partagez vos épreuves pour aider la communauté.
        </p>
      </div>

      {/* Règles */}
      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-semibold">Consignes de contribution</p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-700">
            <li>Fichiers PDF uniquement, 4 Mo maximum par fichier</li>
            <li>Maximum 5 fichiers par envoi</li>
            <li>Décrivez précisément chaque épreuve (école, filière, année, matière)</li>
            <li>Chaque contribution sera vérifiée avant publication</li>
          </ul>
        </div>
      </div>

      {user ? (
        /* Utilisateur connecté : afficher le formulaire */
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-800" />
            <h2 className="text-base font-semibold text-gray-900">Déposer des épreuves</h2>
          </div>
          <ContribuerForm />
        </div>
      ) : (
        /* Visiteur non connecté : invitation à se connecter */
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Upload className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Connexion requise pour contribuer
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Vous devez être connecté pour envoyer des épreuves. C&apos;est rapide et gratuit.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/connexion?next=/contribuer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-3 text-base font-semibold text-white hover:bg-blue-900 transition-colors sm:w-auto"
            >
              <LogIn className="h-4 w-4" /> Se connecter
            </Link>
            <Link
              href="/inscription"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors sm:w-auto"
            >
              <UserPlus className="h-4 w-4" /> Créer un compte
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
