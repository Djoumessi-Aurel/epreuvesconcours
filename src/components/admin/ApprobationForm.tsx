'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { approuverContribution } from '@/lib/actions/admin.actions'
import { createClient } from '@/lib/supabase/client'

type FiliereSimple = {
  code_ecole: string
  nom_filiere: string
  niveau: string
  code_filiere: string
  ecoles: { nom_reduit: string } | null
}

interface Props {
  contributionId: number
}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50 disabled:text-gray-400'

export function ApprobationForm({ contributionId }: Props) {
  const [state, action, isPending] = useActionState(approuverContribution, {})
  const [filieres, setFilieres] = useState<FiliereSimple[]>([])
  const [chargement, setChargement] = useState(true)

  // Cascade
  const [codeEcole, setCodeEcole] = useState('')
  const [niveau, setNiveau] = useState('')
  const [codeFiliere, setCodeFiliere] = useState('')

  const anneeActuelle = new Date().getFullYear()

  // Charger toutes les filières une seule fois
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('filieres')
      .select('code_ecole, nom_filiere, niveau, code_filiere, ecoles(nom_reduit)')
      .order('code_ecole, niveau, nom_filiere')
      .then(({ data }) => {
        setFilieres((data as unknown as FiliereSimple[]) ?? [])
        setChargement(false)
      })
  }, [])

  // ── Dérivations cascade ──────────────────────────────────────────────────

  const ecoles = useMemo(() => {
    const map = new Map<string, string>()
    filieres.forEach((f) => {
      if (!map.has(f.code_ecole))
        map.set(f.code_ecole, f.ecoles?.nom_reduit ?? f.code_ecole)
    })
    return [...map.entries()]
      .map(([code, nom]) => ({ code, nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom))
  }, [filieres])

  const filieresPourEcole = useMemo(
    () => filieres.filter((f) => f.code_ecole === codeEcole),
    [filieres, codeEcole]
  )

  const niveaux = useMemo(
    () => [...new Set(filieresPourEcole.map((f) => f.niveau).filter(Boolean))].sort(),
    [filieresPourEcole]
  )

  const afficherNiveau = niveaux.length > 1

  const filieresFinales = useMemo(() => {
    if (!codeEcole) return []
    if (afficherNiveau) return niveau ? filieresPourEcole.filter((f) => f.niveau === niveau) : []
    return filieresPourEcole
  }, [filieresPourEcole, afficherNiveau, niveau, codeEcole])

  function changerEcole(val: string) {
    setCodeEcole(val)
    setNiveau('')
    setCodeFiliere('')
  }

  const peutSoumettre =
    codeFiliere && !isPending

  if (chargement) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement des filières…
      </div>
    )
  }

  return (
    <form action={action} className="mt-3 space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
      <input type="hidden" name="id" value={contributionId} />

      {state.success && (
        <div className="flex items-center gap-2 text-sm font-medium text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" /> {state.success}
        </div>
      )}
      {state.error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
        Publier comme épreuve
      </p>

      {/* École */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">École</label>
        <select
          value={codeEcole}
          onChange={(e) => changerEcole(e.target.value)}
          className={inputClass}
        >
          <option value="">Sélectionner…</option>
          {ecoles.map((e) => (
            <option key={e.code} value={e.code}>{e.nom}</option>
          ))}
        </select>
      </div>

      {/* Niveau (conditionnel) */}
      {afficherNiveau && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Niveau</label>
          <select
            value={niveau}
            onChange={(e) => { setNiveau(e.target.value); setCodeFiliere('') }}
            disabled={!codeEcole}
            className={inputClass}
          >
            <option value="">Sélectionner…</option>
            {niveaux.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {/* Filière */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Filière</label>
        <select
          name="codeFiliere"
          value={codeFiliere}
          onChange={(e) => setCodeFiliere(e.target.value)}
          disabled={filieresFinales.length === 0}
          className={inputClass}
        >
          <option value="">Sélectionner…</option>
          {filieresFinales.map((f) => (
            <option key={f.code_filiere} value={f.code_filiere}>
              {f.nom_filiere}{f.niveau ? ` — Niveau ${f.niveau}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Matière */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Matière</label>
        <input
          type="text"
          name="matiere"
          required
          placeholder="Ex : Mathématiques et Statistique"
          className={inputClass}
        />
      </div>

      {/* Année */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Année</label>
        <input
          type="number"
          name="annee"
          required
          min={1990}
          max={anneeActuelle}
          placeholder={String(anneeActuelle)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={!peutSoumettre}
        className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Publication…</>
        ) : (
          <><CheckCircle className="h-4 w-4" /> Confirmer et publier</>
        )}
      </button>
    </form>
  )
}
