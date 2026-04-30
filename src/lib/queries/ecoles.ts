import { cacheLife } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import type { Database } from '@/types/database.types'

export type Ecole = Database['public']['Tables']['ecoles']['Row']

export async function getEcoles(): Promise<Ecole[]> {
  'use cache'
  cacheLife('days')

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('ecoles')
    .select('*')
    .order('nom_reduit')

  if (error) throw new Error(`getEcoles: ${error.message}`)
  return data ?? []
}

export async function getEcoleByCode(codeEcole: string): Promise<Ecole | null> {
  'use cache'
  cacheLife('days')

  const supabase = createPublicClient()
  const { data } = await supabase
    .from('ecoles')
    .select('*')
    .eq('code_ecole', codeEcole)
    .single()

  return data
}

/** Écoles regroupées par type de concours */
export async function getEcolesParType(): Promise<Record<string, Ecole[]>> {
  'use cache'
  cacheLife('days')

  const ecoles = await getEcoles()
  return ecoles.reduce<Record<string, Ecole[]>>((acc, ecole) => {
    const type = ecole.type_concours
    if (!acc[type]) acc[type] = []
    acc[type].push(ecole)
    return acc
  }, {})
}
