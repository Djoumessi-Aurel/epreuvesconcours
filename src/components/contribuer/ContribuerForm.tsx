'use client'

import { useTransition, useRef, useState } from 'react'
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { soumettreFichiers } from '@/lib/actions/contribuer.actions'
import type { ContribuerState } from '@/lib/actions/contribuer.actions'

const MAX_FICHIERS = 5
const MAX_TAILLE_MO = 4
const MAX_TAILLE = MAX_TAILLE_MO * 1024 * 1024

export function ContribuerForm() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<ContribuerState>({})
  const [fichiers, setFichiers] = useState<File[]>([])
  const [details, setDetails] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function ajouterFichiers(liste: FileList | null) {
    if (!liste) return
    const pdfs = Array.from(liste).filter((f) => f.type === 'application/pdf')
    setFichiers((prev) => [...prev, ...pdfs].slice(0, MAX_FICHIERS))
  }

  function retirerFichier(index: number) {
    setFichiers((prev) => prev.filter((_, i) => i !== index))
  }

  function formatTaille(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} Ko`
      : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    fichiers.forEach((f) => formData.append('fichiers', f))
    formData.append('details', details)

    startTransition(async () => {
      const result = await soumettreFichiers({}, formData)
      setState(result)
      if (result.success) {
        setFichiers([])
        setDetails('')
      }
    })
  }

  const aFichiersInvalides = fichiers.some((f) => f.size > MAX_TAILLE)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Messages */}
      {state.success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div className="text-sm text-green-700">
            <p className="font-semibold">Contribution envoyée avec succès !</p>
            <p className="mt-0.5">Elle sera examinée par un modérateur avant publication.</p>
            {state.details && <p className="mt-1 text-green-600">{state.details}</p>}
          </div>
        </div>
      )}
      {state.error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {/* Zone de dépôt */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">
          Fichiers PDF{' '}
          <span className="text-gray-400">
            (max {MAX_FICHIERS} fichiers, {MAX_TAILLE_MO} Mo chacun)
          </span>
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); ajouterFichiers(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <Upload className={`h-8 w-8 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="text-center">
            <p className="text-base font-medium text-gray-700">Glissez vos fichiers ici</p>
            <p className="mt-0.5 text-sm text-gray-500">ou cliquez pour sélectionner</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => ajouterFichiers(e.target.files)}
          />
        </div>

        {fichiers.length > 0 && (
          <ul className="mt-3 space-y-2">
            {fichiers.map((f, i) => {
              const tropGros = f.size > MAX_TAILLE
              return (
                <li
                  key={i}
                  className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
                    tropGros ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className={`h-4 w-4 shrink-0 ${tropGros ? 'text-red-400' : 'text-gray-400'}`} />
                    <span className="truncate text-sm text-gray-800">{f.name}</span>
                    <span className={`shrink-0 text-xs ${tropGros ? 'font-medium text-red-600' : 'text-gray-500'}`}>
                      {formatTaille(f.size)}{tropGros ? ' — trop grand' : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => retirerFichier(i)}
                    className="ml-2 shrink-0 rounded p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Retirer ce fichier"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-700">
          Description{' '}
          <span className="text-gray-400">(école, filière, année, matière…)</span>
        </label>
        <textarea
          id="details"
          required
          rows={4}
          minLength={10}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Ex : ISSEA — ITSA — 2019 — Mathématiques et Analyse numérique"
          className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || fichiers.length === 0 || aFichiersInvalides}
        className="w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed sm:w-auto sm:px-8"
      >
        {isPending
          ? 'Envoi en cours…'
          : `Envoyer${fichiers.length > 0 ? ` (${fichiers.length} fichier${fichiers.length > 1 ? 's' : ''})` : ''}`}
      </button>
    </form>
  )
}
