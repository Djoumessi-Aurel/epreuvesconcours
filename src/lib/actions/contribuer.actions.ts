'use server'

import { createClient } from '@/lib/supabase/server'

export type ContribuerState = { error?: string; success?: boolean; details?: string }

const MAX_FICHIERS = 5
const MAX_TAILLE_MO = 4
const MAX_TAILLE = MAX_TAILLE_MO * 1024 * 1024
const BUCKET = process.env.SUPABASE_BUCKET ?? 'site-epreuves'

export async function soumettreFichiers(
  prevState: ContribuerState,
  formData: FormData
): Promise<ContribuerState> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Vous devez être connecté pour contribuer.' }

    const details = (formData.get('details') as string)?.trim()
    if (!details || details.length < 10) {
      return { error: 'Veuillez décrire les fichiers (10 caractères minimum).' }
    }

    const fichiers = formData.getAll('fichiers') as File[]
    const fichiersValides = fichiers.filter((f) => f.size > 0)

    if (fichiersValides.length === 0) return { error: 'Sélectionnez au moins un fichier.' }
    if (fichiersValides.length > MAX_FICHIERS) {
      return { error: `Maximum ${MAX_FICHIERS} fichiers par contribution.` }
    }

    for (const fichier of fichiersValides) {
      if (fichier.type !== 'application/pdf') {
        return { error: `"${fichier.name}" n'est pas un PDF.` }
      }
      if (fichier.size > MAX_TAILLE) {
        return { error: `"${fichier.name}" dépasse ${MAX_TAILLE_MO} Mo.` }
      }
    }

    const erreurs: string[] = []

    for (const fichier of fichiersValides) {
      const timestamp = Date.now()
      const nomSanitize = fichier.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${user.id}/${timestamp}-${nomSanitize}`
      const fullPath = `contributions/${storagePath}`

      const buffer = Buffer.from(await fichier.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fullPath, buffer, { contentType: 'application/pdf' })

      if (uploadError) {
        console.error('Upload error:', uploadError.message)
        erreurs.push(fichier.name)
        continue
      }

      const { error: dbError } = await supabase.from('contributions').insert({
        id_membre: user.id,
        details,
        storage_path: storagePath,
        nom_fichier: fichier.name,
      })

      if (dbError) {
        console.error('DB insert error:', dbError.message)
        await supabase.storage.from(BUCKET).remove([fullPath])
        erreurs.push(fichier.name)
      }
    }

    if (erreurs.length === fichiersValides.length) {
      return { error: "Erreur lors de l'envoi des fichiers. Réessayez." }
    }
    if (erreurs.length > 0) {
      return {
        success: true,
        details: `Certains fichiers n'ont pas pu être envoyés : ${erreurs.join(', ')}`,
      }
    }

    return { success: true }
  } catch (err) {
    console.error('soumettreFichiers unexpected error:', err)
    return { error: "Une erreur inattendue s'est produite. Réessayez." }
  }
}
