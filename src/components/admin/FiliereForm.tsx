'use client'

import { useTransition, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import type { AdminActionState } from '@/lib/actions/admin.actions'
import type { Filiere } from '@/lib/queries/filieres'
import type { Ecole } from '@/lib/queries/ecoles'

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50'

interface Props {
  action: (prevState: AdminActionState, formData: FormData) => Promise<AdminActionState>
  filiere?: Filiere
  ecoles?: Ecole[]
  onSuccess?: (msg: string) => void
}

export function FiliereForm({ action, filiere, ecoles = [], onSuccess }: Props) {
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

  const isEdit = !!filiere

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">{state.success}</p>
      )}

      {isEdit && <input type="hidden" name="code_filiere" value={filiere.code_filiere} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code filière <span className="text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-gray-400">(immuable)</span>
            </label>
            <input
              name="code_filiere"
              type="text"
              placeholder="Ex : ISSEA-ITSA"
              required
              className={`mt-1.5 ${inputClass} uppercase`}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            École <span className="text-red-500">*</span>
          </label>
          {isEdit ? (
            <>
              <input type="hidden" name="code_ecole" value={filiere.code_ecole} />
              <input value={filiere.code_ecole} disabled className={`mt-1.5 ${inputClass}`} />
            </>
          ) : (
            <select name="code_ecole" required defaultValue="" className={`mt-1.5 ${inputClass}`}>
              <option value="">Sélectionner…</option>
              {ecoles.map((e) => (
                <option key={e.code_ecole} value={e.code_ecole}>{e.nom_reduit}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nom de la filière <span className="text-red-500">*</span>
          </label>
          <input
            name="nom_filiere"
            type="text"
            defaultValue={filiere?.nom_filiere}
            placeholder="Ex : Ingénieurs Statisticiens Économistes"
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Niveau</label>
          <input
            name="niveau"
            type="text"
            defaultValue={filiere?.niveau}
            placeholder="Ex : Bac, Licence, BTS…"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? 'Enregistrer les modifications' : 'Créer la filière'}
        </button>
      </div>
    </form>
  )
}
