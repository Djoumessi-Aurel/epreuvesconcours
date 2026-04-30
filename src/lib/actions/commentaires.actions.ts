'use server'

import { createClient } from '@/lib/supabase/server'

export type CommentaireState = { error?: string; success?: boolean }

export async function posterCommentaire(
  prevState: CommentaireState,
  formData: FormData
): Promise<CommentaireState> {
  const contenu = (formData.get('contenu') as string)?.trim()
  const codePage = formData.get('codePage') as string
  const idParentStr = formData.get('idParent') as string | null
  const auteurNomInput = (formData.get('auteurNom') as string)?.trim()

  if (!contenu || contenu.length < 2) {
    return { error: 'Le commentaire est trop court.' }
  }
  if (contenu.length > 2000) {
    return { error: 'Le commentaire ne peut pas dépasser 2000 caractères.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let auteurNom: string
  let idMembre: string | null = null

  if (user) {
    const { data: profil } = await supabase
      .from('profils')
      .select('pseudo')
      .eq('id', user.id)
      .single() as { data: { pseudo: string | null } | null }
    auteurNom = profil?.pseudo ?? user.email ?? 'Membre'
    idMembre = user.id
  } else {
    if (!auteurNomInput || auteurNomInput.length < 2) {
      return { error: 'Veuillez entrer votre nom ou pseudo.' }
    }
    auteurNom = auteurNomInput.slice(0, 50)
  }

  const { error } = await supabase.from('commentaires').insert({
    contenu,
    code_page: codePage,
    auteur_nom: auteurNom,
    id_membre: idMembre,
    id_parent: idParentStr ? parseInt(idParentStr) : null,
  })

  if (error) return { error: 'Erreur lors de la publication. Réessayez.' }

  return { success: true }
}

export async function supprimerCommentaire(id: number): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Non autorisé.' }

  const { data: profil } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  const peutSupprimer =
    profil && ['admin', 'moderateur'].includes(profil.role)

  if (!peutSupprimer) {
    // Vérifier que c'est son propre commentaire
    const { data: commentaire } = await supabase
      .from('commentaires')
      .select('id_membre')
      .eq('id', id)
      .single() as { data: { id_membre: string | null } | null }
    if (!commentaire || commentaire.id_membre !== user.id) {
      return { error: 'Non autorisé.' }
    }
  }

  const { error } = await supabase.from('commentaires').delete().eq('id', id)
  if (error) return { error: 'Erreur lors de la suppression.' }
  return {}
}
