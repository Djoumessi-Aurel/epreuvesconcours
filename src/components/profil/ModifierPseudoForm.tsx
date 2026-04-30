'use client'

import { useActionState } from 'react'
import { modifierPseudo } from '@/lib/actions/profil.actions'

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition'

export function ModifierPseudoForm({ pseudoActuel }: { pseudoActuel: string }) {
  const [state, action, isPending] = useActionState(modifierPseudo, {})

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Changer de pseudo</h2>
      <form action={action} className="space-y-4">
        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {state.success}
          </div>
        )}
        <div>
          <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700">
            Nouveau pseudo
          </label>
          <input
            id="pseudo"
            name="pseudo"
            type="text"
            required
            minLength={3}
            defaultValue={pseudoActuel}
            autoComplete="username"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
