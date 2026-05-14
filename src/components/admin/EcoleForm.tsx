'use client'

import { useTransition, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import type { AdminActionState } from '@/lib/actions/admin.actions'
import type { Ecole } from '@/lib/queries/ecoles'

const TYPES_CONCOURS = ['Concours Sous-régionaux', 'Concours Nationaux', 'Examens Officiels']

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50'

interface Props {
  action: (prevState: AdminActionState, formData: FormData) => Promise<AdminActionState>
  ecole?: Ecole
  onSuccess?: (msg: string) => void
}

export function EcoleForm({ action, ecole, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<AdminActionState>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await action({}, formData)
      setState(result)
      if (result.success) onSuccess?.(result.success)
    })
  }

  const isEdit = !!ecole

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">{state.success}</p>
      )}

      {/* code_ecole en lecture seule en mode édition */}
      {isEdit
        ? <input type="hidden" name="code_ecole" value={ecole.code_ecole} />
        : (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code <span className="text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-gray-400">(immuable après création)</span>
            </label>
            <input
              name="code_ecole"
              type="text"
              placeholder="Ex : ISSEA"
              required
              className={`mt-1.5 ${inputClass} uppercase`}
            />
          </div>
        )
      }

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            name="nom_ecole"
            type="text"
            defaultValue={ecole?.nom_ecole}
            placeholder="Ex : Institut Sous-régional de Statistique…"
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nom réduit <span className="text-red-500">*</span>
          </label>
          <input
            name="nom_reduit"
            type="text"
            defaultValue={ecole?.nom_reduit}
            placeholder="Ex : ISSEA"
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Type de concours <span className="text-red-500">*</span>
        </label>
        <select name="type_concours" defaultValue={ecole?.type_concours ?? ''} required className={`mt-1.5 ${inputClass}`}>
          <option value="">Sélectionner…</option>
          {TYPES_CONCOURS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? 'Enregistrer les modifications' : 'Créer l\'école'}
        </button>
      </div>
    </form>
  )
}
