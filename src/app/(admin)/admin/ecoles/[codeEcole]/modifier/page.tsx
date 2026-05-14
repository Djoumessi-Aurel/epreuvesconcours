import { connection } from 'next/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EcoleForm } from '@/components/admin/EcoleForm'
import { modifierEcole } from '@/lib/actions/admin.actions'

export const metadata = { title: 'Modifier une école | Admin' }

interface Props { params: Promise<{ codeEcole: string }> }

export default async function ModifierEcolePage({ params }: Props) {
  await connection()
  const { codeEcole } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: ecole } = await supabase
    .from('ecoles')
    .select('*')
    .eq('code_ecole', codeEcole)
    .single()

  if (!ecole) notFound()

  const { data: filieres } = await supabase
    .from('filieres')
    .select('code_filiere, nom_filiere')
    .eq('code_ecole', codeEcole)
    .order('nom_filiere')

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/ecoles" className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour aux écoles
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;école</h1>
        <p className="mt-1 text-sm text-gray-500">
          Code : <span className="font-mono font-semibold text-blue-800">{ecole.code_ecole}</span>
          {' · '}Le code ne peut pas être modifié.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <EcoleForm action={modifierEcole} ecole={ecole} />
      </div>

      {filieres && filieres.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Filières rattachées ({filieres.length})
          </h2>
          <ul className="space-y-1">
            {filieres.map((f) => (
              <li key={f.code_filiere} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{f.nom_filiere}</span>
                <Link
                  href={`/admin/filieres/${f.code_filiere}/modifier`}
                  className="text-xs text-blue-700 hover:underline"
                >
                  Modifier
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
