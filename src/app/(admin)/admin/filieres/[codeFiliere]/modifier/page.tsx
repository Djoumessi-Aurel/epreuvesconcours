import { connection } from 'next/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FiliereForm } from '@/components/admin/FiliereForm'
import { modifierFiliere } from '@/lib/actions/admin.actions'

export const metadata = { title: 'Modifier une filière | Admin' }

interface Props { params: Promise<{ codeFiliere: string }> }

export default async function ModifierFilierePage({ params }: Props) {
  await connection()
  const { codeFiliere } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const [{ data: filiere }, { data: epreuves }] = await Promise.all([
    supabase.from('filieres').select('*').eq('code_filiere', codeFiliere).single(),
    supabase
      .from('epreuves')
      .select('id, annee, matiere')
      .eq('code_filiere', codeFiliere)
      .order('annee', { ascending: false })
      .order('matiere'),
  ])

  if (!filiere) notFound()

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/filieres" className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour aux filières
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier la filière</h1>
        <p className="mt-1 text-sm text-gray-500">
          Code : <span className="font-mono font-semibold text-blue-800">{filiere.code_filiere}</span>
          {' · '}Le code et l&apos;école ne peuvent pas être modifiés.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <FiliereForm action={modifierFiliere} filiere={filiere} />
      </div>

      {epreuves && epreuves.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Épreuves ({epreuves.length})
          </h2>
          <p className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            La suppression de cette filière est bloquée tant qu&apos;elle contient des épreuves.
          </p>
          <ul className="space-y-0.5 text-sm text-gray-700 max-h-48 overflow-y-auto">
            {epreuves.map((ep) => (
              <li key={ep.id} className="flex gap-3">
                <span className="w-12 shrink-0 font-mono text-gray-400">{ep.annee}</span>
                <span>{ep.matiere}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
