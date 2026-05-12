'use server'

import { connection } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Convention PHP : "{codeFiliere} {annee} {matiere}.pdf" (espaces, minuscules sans accents)
function nomFichierEpreuve(codeFiliere: string, annee: number, matiere: string): string {
  const matiereSanitisee = matiere
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return `${codeFiliere.toLowerCase()} ${annee} ${matiereSanitisee}.pdf`
}

export type AdminActionState = { error?: string; success?: string; details?: string }

async function estAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('profils').select('role').eq('id', user.id).single() as { data: { role: string } | null }
  return !!data && ['admin', 'moderateur'].includes(data.role)
}

export async function approuverContribution(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!await estAdmin()) return { error: 'Non autorisé.' }

  const supabase = await createClient()
  const id = parseInt(formData.get('id') as string)
  const codeFiliere = (formData.get('codeFiliere') as string)?.trim()
  const matiere = (formData.get('matiere') as string)?.trim()
  const anneeStr = (formData.get('annee') as string)?.trim()

  if (!codeFiliere || !matiere || !anneeStr) {
    return { error: 'Filière, matière et année sont obligatoires.' }
  }

  const annee = parseInt(anneeStr)
  if (isNaN(annee) || annee < 1990 || annee > new Date().getFullYear()) {
    return { error: 'Année invalide.' }
  }

  const { data: contribution } = await supabase
    .from('contributions')
    .select('storage_path')
    .eq('id', id)
    .single() as { data: { storage_path: string } | null }

  if (!contribution) return { error: 'Contribution introuvable.' }

  const adminSupabase = createAdminClient()
  const BUCKET = process.env.SUPABASE_BUCKET ?? 'site-epreuves'
  const srcPath = `contributions/${contribution.storage_path}`
  const storagePath = `${codeFiliere}/${nomFichierEpreuve(codeFiliere, annee, matiere)}`
  const destPath = `epreuves/${storagePath}`

  const { data: fileData, error: downloadError } = await adminSupabase.storage
    .from(BUCKET)
    .download(srcPath)

  if (downloadError || !fileData) {
    return { error: `Erreur lecture du fichier : ${downloadError?.message}` }
  }

  const { data: epreuveExistante } = await supabase
    .from('epreuves')
    .select('storage_path')
    .eq('code_filiere', codeFiliere)
    .eq('annee', annee)
    .eq('matiere', matiere)
    .single() as { data: { storage_path: string } | null }

  if (epreuveExistante && epreuveExistante.storage_path !== storagePath) {
    await adminSupabase.storage.from(BUCKET).remove([`epreuves/${epreuveExistante.storage_path}`])
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())
  const { error: uploadError } = await adminSupabase.storage
    .from(BUCKET)
    .upload(destPath, buffer, { contentType: 'application/pdf', upsert: true })

  if (uploadError) return { error: `Erreur publication fichier : ${uploadError.message}` }

  const { error: dbError } = await supabase.from('epreuves').upsert(
    { code_filiere: codeFiliere, matiere, annee, storage_path: storagePath },
    { onConflict: 'code_filiere,annee,matiere' }
  )

  if (dbError) {
    await adminSupabase.storage.from(BUCKET).remove([destPath])
    return { error: `Erreur base de données : ${dbError.message}` }
  }

  await adminSupabase.storage.from(BUCKET).remove([srcPath])

  await supabase
    .from('contributions')
    .update({ statut: 'approuvee', traite_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin')
  revalidatePath(`/epreuves/${codeFiliere}`)
  return { success: `Épreuve publiée : ${matiere} — ${annee}.` }
}

export async function rejeterContribution(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!await estAdmin()) return { error: 'Non autorisé.' }

  const supabase = await createClient()
  const id = parseInt(formData.get('id') as string)
  const note = (formData.get('note') as string)?.trim() ?? ''

  const { data: contribution } = await supabase
    .from('contributions')
    .select('storage_path')
    .eq('id', id)
    .single() as { data: { storage_path: string } | null }

  const { error } = await supabase
    .from('contributions')
    .update({
      statut: 'rejetee',
      note_moderateur: note || null,
      traite_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: 'Erreur lors du rejet.' }

  if (contribution?.storage_path) {
    const BUCKET = process.env.SUPABASE_BUCKET ?? 'site-epreuves'
    await createAdminClient().storage.from(BUCKET).remove([`contributions/${contribution.storage_path}`])
  }

  revalidatePath('/admin')
  return { success: 'Contribution rejetée et fichier supprimé.' }
}

export async function uploadEpreuves(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await connection()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorisé.' }

    const codeFiliere = (formData.get('codeFiliere') as string)?.trim()
    const anneeStr = (formData.get('annee') as string)?.trim()

    if (!codeFiliere || !anneeStr) return { error: 'Filière et année sont obligatoires.' }

    const annee = parseInt(anneeStr)
    if (isNaN(annee) || annee < 1990 || annee > new Date().getFullYear()) {
      return { error: 'Année invalide.' }
    }

    const lignes: Array<{ matiere: string; fichier: File }> = []
    let i = 0
    while (formData.has(`matiere_${i}`)) {
      const matiere = (formData.get(`matiere_${i}`) as string)?.trim()
      const fichier = formData.get(`fichier_${i}`) as File
      if (matiere && fichier?.size > 0) lignes.push({ matiere, fichier })
      i++
    }

    if (lignes.length === 0) {
      return { error: 'Ajoutez au moins une épreuve avec un fichier PDF.' }
    }

    const adminSupabase = createAdminClient()
    const BUCKET = process.env.SUPABASE_BUCKET ?? 'site-epreuves'
    const publiees: string[] = []
    const erreurs: string[] = []

    for (const { matiere, fichier } of lignes) {
      if (fichier.type !== 'application/pdf') {
        erreurs.push(`"${matiere}" : pas un PDF`)
        continue
      }
      if (fichier.size > 10 * 1024 * 1024) {
        erreurs.push(`"${matiere}" : dépasse 10 Mo`)
        continue
      }

      const storagePath = `${codeFiliere}/${nomFichierEpreuve(codeFiliere, annee, matiere)}`
      const buffer = Buffer.from(await fichier.arrayBuffer())

      const { error: uploadError } = await adminSupabase.storage
        .from(BUCKET)
        .upload(`epreuves/${storagePath}`, buffer, { contentType: 'application/pdf', upsert: true })

      if (uploadError) {
        erreurs.push(`"${matiere}" : erreur storage`)
        continue
      }

      const { error: dbError } = await supabase.from('epreuves').upsert(
        { code_filiere: codeFiliere, matiere, annee, storage_path: storagePath },
        { onConflict: 'code_filiere,annee,matiere' }
      )

      if (dbError) {
        await adminSupabase.storage.from(BUCKET).remove([`epreuves/${storagePath}`])
        erreurs.push(`"${matiere}" : ${dbError.message}`)
        continue
      }

      publiees.push(matiere)
    }

    revalidatePath(`/epreuves/${codeFiliere}`)

    if (publiees.length === 0) {
      return { error: `Aucune épreuve publiée. ${erreurs.join(' — ')}` }
    }

    const msgOk = `${publiees.length} épreuve${publiees.length > 1 ? 's' : ''} publiée${publiees.length > 1 ? 's' : ''} : ${publiees.join(', ')}.`
    if (erreurs.length > 0) return { success: msgOk, details: `Échecs : ${erreurs.join(' — ')}` }
    return { success: msgOk }
  } catch (err) {
    console.error('uploadEpreuves error:', err)
    return { error: "Une erreur inattendue s'est produite." }
  }
}
