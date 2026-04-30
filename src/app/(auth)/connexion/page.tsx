'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTransition } from 'react'
import { connecter } from '@/lib/actions/auth.actions'

export default function ConnexionPage() {
  const searchParams = useSearchParams()
  const inscritOk = searchParams.get('inscrit') === '1'
  const erreur = searchParams.get('erreur') === '1'
  const next = searchParams.get('next') ?? ''

  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(() => {
      connecter(formData)
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
      <p className="mt-1.5 text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-medium text-blue-800 hover:underline">
          S&apos;inscrire gratuitement
        </Link>
      </p>

      <form action={handleSubmit} className="mt-6 space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        {inscritOk && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Inscription réussie ! Vérifiez votre boîte email pour confirmer votre compte.
          </div>
        )}
        {erreur && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Email ou mot de passe incorrect.
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={isPending}
            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="motDePasse"
            name="motDePasse"
            type="password"
            required
            autoComplete="current-password"
            disabled={isPending}
            className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-semibold text-white hover:bg-blue-900 transition-colors disabled:bg-blue-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Connexion en cours...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>
    </div>
  )
}
