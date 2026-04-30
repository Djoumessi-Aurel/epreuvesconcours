import { createClient } from '@supabase/supabase-js'
import { cacheLife } from 'next/cache'

/** Client admin pour les opérations de stats (bypass RLS) */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function incrementerVisite(): Promise<void> {
  const supabase = getAdminClient()
  const today = new Date().toISOString().split('T')[0]

  await supabase.rpc('incrementer_visite', { p_jour: today }).throwOnError()
}

export async function getNbVisitesTotales(): Promise<number> {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 3600 })

  const supabase = getAdminClient()
  const { data } = await supabase
    .from('visites')
    .select('nb_visites')

  return (data ?? []).reduce((sum, row) => sum + row.nb_visites, 0)
}

export async function getNbVisitesAujourdhui(): Promise<number> {
  'use cache'
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 })

  const supabase = getAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('visites')
    .select('nb_visites')
    .eq('jour', today)
    .single() as { data: { nb_visites: number } | null }

  return data?.nb_visites ?? 0
}
