import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FilieresAdmin } from '@/components/admin/FilieresAdmin'

export const metadata = { title: 'Filières | Admin' }

export default async function FilieresPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const [{ data: filieresData }, { data: ecoles }] = await Promise.all([
    supabase
      .from('filieres')
      .select('*, ecoles(nom_reduit), epreuves(count)')
      .order('code_ecole, nom_filiere'),
    supabase.from('ecoles').select('*').order('nom_reduit'),
  ])

  const filieres = (filieresData ?? []).map((f) => ({
    ...f,
    nom_ecole: (f.ecoles as unknown as { nom_reduit: string } | null)?.nom_reduit ?? f.code_ecole,
    nb_epreuves: (f.epreuves as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return <FilieresAdmin filieres={filieres} ecoles={ecoles ?? []} />
}
