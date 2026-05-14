import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EcolesAdmin } from '@/components/admin/EcolesAdmin'

export const metadata = { title: 'Écoles | Admin' }

export default async function EcolesPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data } = await supabase
    .from('ecoles')
    .select('*, filieres(count)')
    .order('nom_reduit')

  const ecoles = (data ?? []).map((e) => ({
    ...e,
    nb_filieres: (e.filieres as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return <EcolesAdmin ecoles={ecoles} />
}
