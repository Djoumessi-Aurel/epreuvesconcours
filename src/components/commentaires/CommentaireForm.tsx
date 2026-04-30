'use client'

import { useActionState, useEffect, useRef } from 'react'
import { posterCommentaire } from '@/lib/actions/commentaires.actions'
import type { User } from '@supabase/supabase-js'

interface Props {
  codePage: string
  idParent?: number
  user: User | null
  pseudoMembre?: string
  onSuccess?: () => void
}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition'

export function CommentaireForm({ codePage, idParent, user, pseudoMembre, onSuccess }: Props) {
  const [state, action, isPending] = useActionState(posterCommentaire, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      onSuccess?.()
    }
  }, [state.success, onSuccess])

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="codePage" value={codePage} />
      {idParent && <input type="hidden" name="idParent" value={idParent} />}

      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {!user && (
        <div>
          <label htmlFor={`auteurNom-${idParent ?? 'root'}`} className="block text-sm font-medium text-gray-700">
            Votre nom / pseudo
          </label>
          <input
            id={`auteurNom-${idParent ?? 'root'}`}
            name="auteurNom"
            type="text"
            required
            maxLength={50}
            placeholder="Anonyme"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      )}

      {user && (
        <p className="text-sm text-gray-600">
          Vous commentez en tant que <span className="font-semibold text-gray-900">{pseudoMembre}</span>
        </p>
      )}

      <div>
        <label htmlFor={`contenu-${idParent ?? 'root'}`} className="sr-only">
          Commentaire
        </label>
        <textarea
          id={`contenu-${idParent ?? 'root'}`}
          name="contenu"
          required
          rows={idParent ? 3 : 4}
          maxLength={2000}
          placeholder={idParent ? 'Votre réponse…' : 'Votre commentaire…'}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-60"
      >
        {isPending ? 'Publication…' : idParent ? 'Répondre' : 'Publier le commentaire'}
      </button>
    </form>
  )
}
