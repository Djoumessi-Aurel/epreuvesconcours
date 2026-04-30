'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CommentaireForm } from './CommentaireForm'
import { CommentaireItem } from './CommentaireItem'
import type { Commentaire } from '@/lib/queries/commentaires'
import type { User } from '@supabase/supabase-js'
import type { RoleMembre } from '@/types/database.types'

interface Props {
  codePage: string
}

export function CommentairesList({ codePage }: Props) {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([])
  const [chargement, setChargement] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [roleUser, setRoleUser] = useState<RoleMembre | null>(null)
  const [pseudoMembre, setPseudoMembre] = useState<string | undefined>()

  const chargerCommentaires = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('commentaires')
      .select('*')
      .eq('code_page', codePage)
      .order('created_at', { ascending: true })
    setCommentaires(data ?? [])
    setChargement(false)
  }, [codePage])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: profil } = await supabase
          .from('profils')
          .select('role, pseudo')
          .eq('id', data.user.id)
          .single() as { data: { role: string; pseudo: string | null } | null }
        setRoleUser((profil?.role as RoleMembre) ?? null)
        setPseudoMembre(profil?.pseudo ?? data.user.email ?? undefined)
      }
    })

    chargerCommentaires()
  }, [chargerCommentaires])

  const topLevel = commentaires.filter((c) => c.id_parent === null)
  const repliesMap = commentaires.reduce<Record<number, Commentaire[]>>((acc, c) => {
    if (c.id_parent !== null) {
      acc[c.id_parent] = [...(acc[c.id_parent] ?? []), c]
    }
    return acc
  }, {})

  const total = commentaires.length

  return (
    <section className="mt-10 border-t border-gray-200 pt-8 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        Commentaires{' '}
        {!chargement && total > 0 && (
          <span className="text-base font-normal text-gray-500">({total})</span>
        )}
      </h2>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <CommentaireForm
          codePage={codePage}
          user={user}
          pseudoMembre={pseudoMembre}
          onSuccess={chargerCommentaires}
        />
      </div>

      {chargement ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-base text-gray-500">
          Aucun commentaire pour l&apos;instant. Soyez le premier !
        </p>
      ) : (
        <div className="space-y-5">
          {topLevel.map((c) => (
            <CommentaireItem
              key={c.id}
              commentaire={c}
              replies={repliesMap[c.id] ?? []}
              codePage={codePage}
              user={user}
              roleUser={roleUser}
              pseudoMembre={pseudoMembre}
              onDelete={chargerCommentaires}
            />
          ))}
        </div>
      )}
    </section>
  )
}
