import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EpreuveUploadForm, type FiliereAvecEcole } from '@/components/admin/EpreuveUploadForm'

export const metadata = { title: 'Ajouter une épreuve | Admin' }

export default async function EpreuveUploadPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  // Toutes les filières avec leur école pour les selects en cascade
  const { data: filieres } = await supabase
    .from('filieres')
    .select('*, ecoles(nom_reduit, type_concours)')
    .order('code_ecole, niveau, nom_filiere') as { data: FiliereAvecEcole[] | null }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Ajouter une épreuve</h1>
        <p className="mt-1 text-base text-gray-600">
          Publiez directement une épreuve sans passer par la modération.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-800" />
          <h2 className="text-base font-semibold text-gray-900">Informations de l&apos;épreuve</h2>
        </div>
        <EpreuveUploadForm filieres={filieres ?? []} />
      </div>
    </div>
  )
}
