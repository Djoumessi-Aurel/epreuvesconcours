'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const BUCKET = process.env.SUPABASE_BUCKET ?? 'site-epreuves'

export type ActionState = { error?: string; success?: string }

export async function modifierPseudo(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const pseudo = (formData.get('pseudo') as string)?.trim()

  if (!pseudo || pseudo.length < 3) {
    return { error: 'Le pseudo doit contenir au moins 3 caractères.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Vous devez être connecté.' }

  const { error } = await supabase.from('profils').update({ pseudo }).eq('id', user.id)

  if (error) return { error: 'Erreur lors de la mise à jour du pseudo.' }

  revalidatePath('/profil')
  return { success: 'Pseudo mis à jour avec succès.' }
}

export async function modifierMotDePasse(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nouveauMdp = formData.get('nouveauMdp') as string
  const confirmationMdp = formData.get('confirmationMdp') as string

  if (nouveauMdp !== confirmationMdp) {
    return { error: 'Les mots de passe ne correspondent pas.' }
  }
  if (nouveauMdp.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: nouveauMdp })

  if (error) return { error: 'Erreur lors de la mise à jour du mot de passe.' }

  return { success: 'Mot de passe mis à jour avec succès.' }
}

export async function uploadPhotoProfile(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const photo = formData.get('photo') as File

  if (!photo?.size) return { error: 'Aucun fichier sélectionné.' }

  const formatsAcceptes = ['image/jpeg', 'image/png', 'image/webp']
  if (!formatsAcceptes.includes(photo.type)) {
    return { error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }
  }
  if (photo.size > 2 * 1024 * 1024) {
    return { error: "L'image ne doit pas dépasser 2 Mo." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Vous devez être connecté.' }

  const ext = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg'
  const nouveauPath = `${user.id}.${ext}`

  // Supprimer l'ancienne photo si l'extension a changé
  const { data: profil } = await supabase
    .from('profils')
    .select('photo_storage_path')
    .eq('id', user.id)
    .single() as { data: { photo_storage_path: string | null } | null }

  if (profil?.photo_storage_path && profil.photo_storage_path !== nouveauPath) {
    await supabase.storage.from(BUCKET).remove([`photos-profil/${profil.photo_storage_path}`])
  }

  const buffer = Buffer.from(await photo.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(`photos-profil/${nouveauPath}`, buffer, { contentType: photo.type, upsert: true })

  if (uploadError) return { error: `Erreur upload : ${uploadError.message}` }

  const { error: dbError } = await supabase
    .from('profils')
    .update({ photo_storage_path: nouveauPath })
    .eq('id', user.id)

  if (dbError) return { error: 'Erreur mise à jour du profil.' }

  revalidatePath('/profil')
  return { success: 'Photo de profil mise à jour.' }
}
