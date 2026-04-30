'use client'

import { useState } from 'react'
import { MessageSquare, Trash2, UserCircle } from 'lucide-react'
import { supprimerCommentaire } from '@/lib/actions/commentaires.actions'
import { formatRelative } from '@/lib/utils/format-date'
import { CommentaireForm } from './CommentaireForm'
import type { Commentaire } from '@/lib/queries/commentaires'
import type { User } from '@supabase/supabase-js'
import type { RoleMembre } from '@/types/database.types'

interface Props {
  commentaire: Commentaire
  replies: Commentaire[]
  codePage: string
  user: User | null
  roleUser: RoleMembre | null
  pseudoMembre?: string
  estReponse?: boolean
  onDelete?: () => void
}

export function CommentaireItem({
  commentaire,
  replies,
  codePage,
  user,
  roleUser,
  pseudoMembre,
  estReponse = false,
  onDelete,
}: Props) {
  const [repondreOuvert, setRepondreOuvert] = useState(false)
  const [suppression, setSuppression] = useState(false)

  const peutSupprimer =
    user &&
    ((['admin', 'moderateur'] as RoleMembre[]).includes(roleUser as RoleMembre) ||
      commentaire.id_membre === user.id)

  async function handleSupprimer() {
    if (!confirm('Supprimer ce commentaire ?')) return
    setSuppression(true)
    await supprimerCommentaire(commentaire.id)
    onDelete?.()
  }

  return (
    <div className={`flex gap-3 ${estReponse ? 'ml-8 mt-3' : ''}`}>
      <div className="mt-0.5 shrink-0 text-gray-300">
        <UserCircle className="h-8 w-8" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-xs">
          {/* En-tête */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <span className="text-sm font-semibold text-gray-900">{commentaire.auteur_nom}</span>
            <span className="text-xs text-gray-500">{formatRelative(commentaire.created_at)}</span>
          </div>

          {/* Contenu */}
          <p className="mt-2 whitespace-pre-wrap text-base text-gray-800 leading-relaxed">
            {commentaire.contenu}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-1.5 flex items-center gap-3 px-1">
          {!estReponse && (
            <button
              onClick={() => setRepondreOuvert((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-800 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {repondreOuvert ? 'Annuler' : 'Répondre'}
            </button>
          )}
          {peutSupprimer && (
            <button
              onClick={handleSupprimer}
              disabled={suppression}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </button>
          )}
        </div>

        {/* Formulaire de réponse */}
        {repondreOuvert && (
          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <CommentaireForm
              codePage={codePage}
              idParent={commentaire.id}
              user={user}
              pseudoMembre={pseudoMembre}
              onSuccess={() => {
                setRepondreOuvert(false)
                onDelete?.()
              }}
            />
          </div>
        )}

        {/* Réponses imbriquées (1 niveau) */}
        {replies.length > 0 && (
          <div className="space-y-2">
            {replies.map((rep) => (
              <CommentaireItem
                key={rep.id}
                commentaire={rep}
                replies={[]}
                codePage={codePage}
                user={user}
                roleUser={roleUser}
                pseudoMembre={pseudoMembre}
                onDelete={onDelete}
                estReponse
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
