import { cacheLife } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { getStorageProvider } from '@/lib/storage/storage-factory'
import type { Database } from '@/types/database.types'

export type Epreuve = Database['public']['Tables']['epreuves']['Row']

export type EpreuveAvecUrl = Epreuve & { downloadUrl: string }

export async function getEpreuvesByFiliere(codeFiliere: string): Promise<EpreuveAvecUrl[]> {
  'use cache'
  cacheLife('hours')

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('epreuves')
    .select('*')
    .eq('code_filiere', codeFiliere)
    .order('annee', { ascending: false })
    .order('matiere')

  if (error) throw new Error(`getEpreuvesByFiliere: ${error.message}`)

  const storage = getStorageProvider()
  return ((data ?? []) as Epreuve[]).map((epreuve) => ({
    ...epreuve,
    downloadUrl: storage.getPublicUrl('epreuves', epreuve.storage_path),
  }))
}

/** Épreuves regroupées par année */
export function groupEpreuvesByAnnee(
  epreuves: EpreuveAvecUrl[]
): Record<number, EpreuveAvecUrl[]> {
  return epreuves.reduce<Record<number, EpreuveAvecUrl[]>>((acc, epreuve) => {
    const annee = epreuve.annee
    if (!acc[annee]) acc[annee] = []
    acc[annee].push(epreuve)
    return acc
  }, {})
}
