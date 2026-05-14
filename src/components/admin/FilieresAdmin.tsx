'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import { creerFiliere, supprimerFiliere } from '@/lib/actions/admin.actions'
import { FiliereForm } from '@/components/admin/FiliereForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import type { Filiere } from '@/lib/queries/filieres'
import type { Ecole } from '@/lib/queries/ecoles'

type FiliereAvecCount = Filiere & { nb_epreuves: number; nom_ecole: string }

interface Props {
  filieres: FiliereAvecCount[]
  ecoles: Ecole[]
}

export function FilieresAdmin({ filieres: initial, ecoles }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }

  function onMutation() { router.refresh() }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des filières</h1>
          <p className="mt-1 text-sm text-gray-500">{initial.length} filière(s) enregistrée(s)</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nouvelle filière
        </button>
      </div>

      {toast && (
        <p className={`rounded-lg border px-4 py-2.5 text-sm ${toast.type === 'ok' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {toast.msg}
        </p>
      )}

      {showForm && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Créer une filière</h2>
          <FiliereForm
            action={creerFiliere}
            ecoles={ecoles}
            onSuccess={(msg) => { notify(msg); setShowForm(false); onMutation() }}
          />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {initial.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">Aucune filière enregistrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Filière</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">École</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Niveau</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Épreuves</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initial.map((f) => (
                <tr key={f.code_filiere} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-800">{f.code_filiere}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{f.nom_filiere}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{f.nom_ecole}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{f.niveau || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {f.nb_epreuves}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/filieres/${f.code_filiere}/modifier`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Modifier
                      </Link>
                      <DeleteButton
                        action={supprimerFiliere}
                        hiddenFields={{ code_filiere: f.code_filiere }}
                        confirmMessage={`Supprimer la filière "${f.nom_filiere}" ?\n\nCette action est irréversible.`}
                        onSuccess={(msg) => { notify(msg); onMutation() }}
                        onError={(msg) => notify(msg, 'err')}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
