import { cacheLife } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import type { Database } from '@/types/database.types'

export type Filiere = Database['public']['Tables']['filieres']['Row']

export async function getFilieresByEcole(codeEcole: string): Promise<Filiere[]> {
  'use cache'
  cacheLife('days')

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('filieres')
    .select('*')
    .eq('code_ecole', codeEcole)
    .order('nom_filiere')

  if (error) throw new Error(`getFilieresByEcole: ${error.message}`)
  return data ?? []
}

export async function getFiliereByCode(codeFiliere: string): Promise<Filiere | null> {
  'use cache'
  cacheLife('days')

  const supabase = createPublicClient()
  const { data } = await supabase
    .from('filieres')
    .select('*')
    .eq('code_filiere', codeFiliere)
    .single()

  return data
}

export async function getAllFilieres(): Promise<{ code_filiere: string }[]> {
  'use cache'
  cacheLife('days')

  const supabase = createPublicClient()
  const { data } = await supabase.from('filieres').select('code_filiere')
  return (data ?? []) as { code_filiere: string }[]
}
