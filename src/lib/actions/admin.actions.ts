'use server'

import { connection } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// CRUD Écoles
// ---------------------------------------------------------------------------

export async function creerEcole(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!await estAdmin()) return { error: 'Non autorisé.' }

  const codeEcole   = (formData.get('code_ecole') as string)?.trim().toUpperCase()
  const nomEcole    = (formData.get('nom_ecole') as string)?.trim()
  const nomReduit   = (formData.get('nom_reduit') as string)?.trim()
  const typeConcours = (formData.get('type_concours') as string)?.trim()

  if (!codeEcole || !nomEcole || !nomReduit || !typeConcours)
    return { error: 'Tous les champs sont obligatoires.' }

  if (!/^[A-Z0-9\-]{2,20}$/.test(codeEcole))
    return { error: 'Le code doit contenir uniquement des lettres majuscules, chiffres ou tirets (2–20 caractères).' }

  const supabase = await createClient()
  const { error } = await supabase.from('ecoles').insert({ code_ecole: codeEcole, nom_ecole: nomEcole, nom_reduit: nomReduit, type_concours: typeConcours })

  if (error) {
    if (error.code === '23505') return { error: `Le code "${codeEcole}" existe déjà.` }
    return { error: `Erreur base de données : ${error.message}` }
  }

  revalidatePath('/admin/ecoles')
  revalidatePath('/')
  return { success: `École "${nomReduit}" créée.` }
}

export async function modifierEcole(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!await estAdmin()) return { error: 'Non autorisé.' }

  const codeEcole   = (formData.get('code_ecole') as string)?.trim()
  const nomEcole    = (formData.get('nom_ecole') as string)?.trim()
  const nomReduit   = (formData.get('nom_reduit') as string)?.trim()
  const typeConcours = (formData.get('type_concours') as string)?.trim()

  if (!codeEcole || !nomEcole || !nomReduit || !typeConcours)
    return { error: 'Tous les champs sont obligatoires.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('ecoles')
    .update({ nom_ecole: nomEcole, nom_reduit: nomReduit, type_concours: typeConcours })
    .eq('code_ecole', codeEcole)

  if (error) return { error: `Erreur base de données : ${error.message}` }

  revalidatePath('/admin/ecoles')
  revalidatePath(`/concours/${codeEcole}`)
  revalidatePath('/')
  return { success: `École "${nomReduit}" mise à jour.` }
}

export async function supprimerEcole(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!await estAdmin()) return { error: 'Non autorisé.' }

  const codeEcole = (formData.get('code_ecole') as string)?.trim()
  if (!codeEcole) return { error: 'Code école manquant.' }

  const supabase = await createClient()

  const { count } = await supabase
    .from('filieres')
    .select('*', { count: 'exact', head: true })
    .eq('code_ecole', codeEcole)

  if ((count ?? 0) > 0)
    return { error: `Impossible de supprimer : ${count} filière(s) rattachée(s) à cette école. Supprimez-les d'abord.` }

  const { error } = await supabase.from('ecoles').delete().eq('code_ecole', codeEcole)
  if (error) return { error: `Erreur base de données : ${error.message}` }

  revalidatePath('/admin/ecoles')
  revalidatePath('/')
  return { success: 'École supprimée.' }
}

// ---------------------------------------------------------------------------
// CRUD Filières
// ---------------------------------------------------------------------------

export async function creerFiliere(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!await estAdmin()) return { error: 'Non autorisé.' }

  const codeFiliere  = (formData.get('code_filiere') as string)?.trim().toUpperCase()
  const codeEcole    = (formData.get('code_ecole') as string)?.trim()
  const nomFiliere   = (formData.get('nom_filiere') as string)?.trim()
  const niveau       = (formData.get('niveau') as string)?.trim()

  if (!codeFiliere || !codeEcole || !nomFiliere)
    return { error: 'Code filière, école et nom sont obligatoires.' }

  if (!/^[A-Z0-9\-]{2,30}$/.test(codeFiliere))
    return { error: 'Le code doit contenir uniquement des lettres majuscules, chiffres ou tirets (2–30 caractères).' }

  const supabase = await createClient()
  const { error } = await supabase.from('filieres').insert({
    code_filiere: codeFiliere,
    code_ecole: codeEcole,
    nom_filiere: nomFiliere,
    niveau: niveau ?? '',
  })

  if (error) {
    if (error.code === '23505') return { error: `Le code "${codeFiliere}" existe déjà.` }
    if (error.code === '23503') return { error: `L'école "${codeEcole}" n'existe pas.` }
    return { error: `Erreur base de données : ${error.message}` }
  }

  revalidatePath('/admin/filieres')
  revalidatePath(`/concours/${codeEcole}`)
  return { success: `Filière "${nomFiliere}" créée.` }
}

export async function modifierFiliere(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!await estAdmin()) return { error: 'Non autorisé.' }

  const codeFiliere = (formData.get('code_filiere') as string)?.trim()
  const nomFiliere  = (formData.get('nom_filiere') as string)?.trim()
  const niveau      = (formData.get('niveau') as string)?.trim()

  if (!codeFiliere || !nomFiliere)
    return { error: 'Code filière et nom sont obligatoires.' }

  const supabase = await createClient()

  // Récupérer code_ecole pour revalidation
  const { data: existing } = await supabase
    .from('filieres').select('code_ecole').eq('code_filiere', codeFiliere).single()

  const { error } = await supabase
    .from('filieres')
    .update({ nom_filiere: nomFiliere, niveau: niveau ?? '' })
    .eq('code_filiere', codeFiliere)

  if (error) return { error: `Erreur base de données : ${error.message}` }

  revalidatePath('/admin/filieres')
  if (existing?.code_ecole) revalidatePath(`/concours/${existing.code_ecole}`)
  revalidatePath(`/epreuves/${codeFiliere}`)
  return { success: `Filière "${nomFiliere}" mise à jour.` }
}

export async function supprimerFiliere(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!await estAdmin()) return { error: 'Non autorisé.' }

  const codeFiliere = (formData.get('code_filiere') as string)?.trim()
  if (!codeFiliere) return { error: 'Code filière manquant.' }

  const supabase = await createClient()

  const { count } = await supabase
    .from('epreuves')
    .select('*', { count: 'exact', head: true })
    .eq('code_filiere', codeFiliere)

  if ((count ?? 0) > 0)
    return { error: `Impossible de supprimer : ${count} épreuve(s) rattachée(s) à cette filière. Supprimez-les d'abord.` }

  const { data: existing } = await supabase
    .from('filieres').select('code_ecole').eq('code_filiere', codeFiliere).single()

  const { error } = await supabase.from('filieres').delete().eq('code_filiere', codeFiliere)
  if (error) return { error: `Erreur base de données : ${error.message}` }

  revalidatePath('/admin/filieres')
  if (existing?.code_ecole) revalidatePath(`/concours/${existing.code_ecole}`)
  revalidatePath('/')
  return { success: 'Filière supprimée.' }
}

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
