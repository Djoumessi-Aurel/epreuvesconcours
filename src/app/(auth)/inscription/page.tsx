'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { inscrire } from '@/lib/actions/auth.actions'

const inputClass =
  'mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-base text-gray-900 placeholder-gray-400 shadow-xs focus:outline-none focus:ring-2 transition'
const inputNormal = `${inputClass} border-gray-300 focus:border-blue-500 focus:ring-blue-200`
const inputError = `${inputClass} border-red-400 focus:border-red-400 focus:ring-red-100`

export default function InscriptionPage() {
  const [state, action, isPending] = useActionState(inscrire, {})
  const [mdp, setMdp] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const mdpTropCourt = mdp.length > 0 && mdp.length < 8
  const mdpNonCorrespondant = confirmation.length > 0 && mdp !== confirmation
  const formInvalide = mdpTropCourt || mdpNonCorrespondant

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
      <p className="mt-1.5 text-sm text-gray-600">
        Déjà inscrit ?{' '}
        <Link href="/connexion" className="font-medium text-blue-800 hover:underline">
          Se connecter
        </Link>
      </p>

      <form action={action} className="mt-6 space-y-4">
        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700">
            Pseudo <span className="text-gray-400">(visible publiquement)</span>
          </label>
          <input
            id="pseudo"
            name="pseudo"
            type="text"
            required
            minLength={3}
            autoComplete="username"
            placeholder="ex : Jean-Pierre"
            className={inputNormal}
          />
          <p className="mt-1 text-xs text-gray-500">3 caractères minimum</p>
        </div>

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
            className={inputNormal}
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
            minLength={8}
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            className={mdpTropCourt ? inputError : inputNormal}
          />
          {mdpTropCourt && (
            <p className="mt-1 text-xs text-red-600">Le mot de passe doit contenir au moins 8 caractères.</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmation"
            name="confirmation"
            type="password"
            required
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className={mdpNonCorrespondant ? inputError : inputNormal}
          />
          {mdpNonCorrespondant && (
            <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas.</p>
          )}
          {!mdpNonCorrespondant && confirmation.length > 0 && mdp === confirmation && (
            <p className="mt-1 text-xs text-green-600">Les mots de passe correspondent.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || formInvalide}
          className="mt-2 w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Inscription en cours…' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  )
}
