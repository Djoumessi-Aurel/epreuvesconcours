'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import { creerEcole, supprimerEcole } from '@/lib/actions/admin.actions'
import { EcoleForm } from '@/components/admin/EcoleForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import type { Ecole } from '@/lib/queries/ecoles'

type EcoleAvecCount = Ecole & { nb_filieres: number }

interface Props { ecoles: EcoleAvecCount[] }

export function EcolesAdmin({ ecoles: initial }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }

  function onMutation() {
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des écoles</h1>
          <p className="mt-1 text-sm text-gray-500">{initial.length} école(s) enregistrée(s)</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nouvelle école
        </button>
      </div>

      {toast && (
        <p className={`rounded-lg border px-4 py-2.5 text-sm ${toast.type === 'ok' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {toast.msg}
        </p>
      )}

      {showForm && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Créer une école</h2>
          <EcoleForm
            action={creerEcole}
            onSuccess={(msg) => { notify(msg); setShowForm(false); onMutation() }}
          />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {initial.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">Aucune école enregistrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nom</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Filières</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initial.map((e) => (
                <tr key={e.code_ecole} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-800">{e.code_ecole}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{e.nom_reduit}</div>
                    <div className="text-xs text-gray-400">{e.nom_ecole}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{e.type_concours}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                      {e.nb_filieres}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/ecoles/${e.code_ecole}/modifier`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Modifier
                      </Link>
                      <DeleteButton
                        action={supprimerEcole}
                        hiddenFields={{ code_ecole: e.code_ecole }}
                        confirmMessage={`Supprimer l'école "${e.nom_reduit}" ?\n\nCette action est irréversible.`}
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
