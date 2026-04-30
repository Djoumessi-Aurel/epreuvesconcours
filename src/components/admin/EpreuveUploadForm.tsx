'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Plus, Trash2, Upload, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react'
import { uploadEpreuves } from '@/lib/actions/admin.actions'
import type { AdminActionState } from '@/lib/actions/admin.actions'
import { createClient } from '@/lib/supabase/client'

const MAX_LIGNES = 5
const MAX_TAILLE_MO = 10

// Type enrichi avec le join écoles
export type FiliereAvecEcole = {
  id: number
  code_ecole: string
  nom_filiere: string
  niveau: string
  code_filiere: string
  ecoles: { nom_reduit: string; type_concours: string } | null
}

interface Ligne {
  matiere: string
  fichier: File | null
}

interface EpreuveExistante {
  id: number
  matiere: string
}

interface Props {
  filieres: FiliereAvecEcole[]
}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:bg-gray-50 disabled:text-gray-400'

const ligneVide = (): Ligne => ({ matiere: '', fichier: null })

export function EpreuveUploadForm({ filieres }: Props) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<AdminActionState>({})

  // Sélections en cascade
  const [codeEcole, setCodeEcole] = useState('')
  const [niveau, setNiveau] = useState('')
  const [codeFiliere, setCodeFiliere] = useState('')

  // Épreuves à uploader
  const [lignes, setLignes] = useState<Ligne[]>([ligneVide()])
  const [lignesKey, setLignesKey] = useState(0) // force remount des inputs fichier

  // Épreuves existantes
  const [annee, setAnnee] = useState('')
  const [epreuves, setEpreuves] = useState<EpreuveExistante[]>([])
  const [chargementEpreuves, setChargementEpreuves] = useState(false)

  const anneeActuelle = new Date().getFullYear()
  const anneeNum = parseInt(annee)
  const anneeValide = !isNaN(anneeNum) && anneeNum >= 1990 && anneeNum <= anneeActuelle

  // ── Dérivations cascade ──────────────────────────────────────────────────

  const ecoles = useMemo(() => {
    const map = new Map<string, string>()
    filieres.forEach((f) => {
      if (!map.has(f.code_ecole)) {
        map.set(f.code_ecole, f.ecoles?.nom_reduit ?? f.code_ecole)
      }
    })
    return [...map.entries()]
      .map(([code, nom]) => ({ code, nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom))
  }, [filieres])

  const filieresPourEcole = useMemo(
    () => filieres.filter((f) => f.code_ecole === codeEcole),
    [filieres, codeEcole]
  )

  const niveaux = useMemo(() => {
    const vals = [...new Set(filieresPourEcole.map((f) => f.niveau).filter(Boolean))].sort()
    return vals
  }, [filieresPourEcole])

  const afficherNiveau = niveaux.length > 1

  const filieresFinales = useMemo(() => {
    if (!codeEcole) return []
    if (afficherNiveau) return niveau ? filieresPourEcole.filter((f) => f.niveau === niveau) : []
    return filieresPourEcole
  }, [filieresPourEcole, afficherNiveau, niveau, codeEcole])

  // Reset sélections dépendantes en cascade
  function changerEcole(val: string) {
    setCodeEcole(val)
    setNiveau('')
    setCodeFiliere('')
    setState({})
    setEpreuves([])
  }

  function changerNiveau(val: string) {
    setNiveau(val)
    setCodeFiliere('')
    setState({})
    setEpreuves([])
  }

  // ── Chargement épreuves existantes ───────────────────────────────────────

  useEffect(() => {
    if (!codeFiliere || !anneeValide) { setEpreuves([]); return }
    setChargementEpreuves(true)
    const supabase = createClient()
    supabase
      .from('epreuves')
      .select('id, matiere')
      .eq('code_filiere', codeFiliere)
      .eq('annee', anneeNum)
      .order('matiere')
      .then(({ data }) => { setEpreuves(data ?? []); setChargementEpreuves(false) })
  }, [codeFiliere, anneeNum, anneeValide])

  // ── Gestion des lignes ───────────────────────────────────────────────────

  function ajouterLigne() {
    if (lignes.length < MAX_LIGNES) setLignes((l) => [...l, ligneVide()])
  }

  function supprimerLigne(i: number) {
    setLignes((l) => l.filter((_, idx) => idx !== i))
  }

  function setMatiere(i: number, val: string) {
    setLignes((l) => l.map((ligne, idx) => (idx === i ? { ...ligne, matiere: val } : ligne)))
  }

  function setFichier(i: number, file: File | null) {
    setLignes((l) => l.map((ligne, idx) => (idx === i ? { ...ligne, fichier: file } : ligne)))
  }

  const lignesRemplies = lignes.filter((l) => l.matiere.trim() && l.fichier)
  const peutSoumettre = codeFiliere && anneeValide && lignesRemplies.length > 0

  // ── Soumission ───────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.set('codeFiliere', codeFiliere)
    formData.set('annee', annee)
    lignes.forEach((l, i) => {
      if (l.matiere.trim() && l.fichier) {
        formData.append(`matiere_${i}`, l.matiere.trim())
        formData.append(`fichier_${i}`, l.fichier)
      }
    })

    startTransition(async () => {
      const result = await uploadEpreuves({}, formData)
      setState(result)
      if (result.success) {
        // Réinitialiser les lignes + forcer remount des inputs fichier
        setLignes([ligneVide()])
        setLignesKey((k) => k + 1)
        // Recharger la liste
        if (codeFiliere && anneeValide) {
          const supabase = createClient()
          supabase
            .from('epreuves')
            .select('id, matiere')
            .eq('code_filiere', codeFiliere)
            .eq('annee', anneeNum)
            .order('matiere')
            .then(({ data }) => setEpreuves(data ?? []))
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback */}
      {state.success && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div className="text-sm">
            <p className="font-medium text-green-700">{state.success}</p>
            {state.details && <p className="mt-1 text-amber-700">{state.details}</p>}
          </div>
        </div>
      )}
      {state.error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}

      {/* Étape 1 : Contexte */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          1 — Contexte
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">

          {/* École */}
          <div>
            <label htmlFor="codeEcole" className="block text-sm font-medium text-gray-700">
              École / Concours <span className="text-red-500">*</span>
            </label>
            <select
              id="codeEcole"
              value={codeEcole}
              onChange={(e) => changerEcole(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
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
              <label htmlFor="niveau" className="block text-sm font-medium text-gray-700">
                Niveau <span className="text-red-500">*</span>
              </label>
              <select
                id="niveau"
                value={niveau}
                onChange={(e) => changerNiveau(e.target.value)}
                disabled={!codeEcole}
                className={`mt-1.5 ${inputClass}`}
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
            <label htmlFor="codeFiliere" className="block text-sm font-medium text-gray-700">
              Filière <span className="text-red-500">*</span>
            </label>
            <select
              id="codeFiliere"
              value={codeFiliere}
              onChange={(e) => { setCodeFiliere(e.target.value); setState({}) }}
              disabled={filieresFinales.length === 0}
              className={`mt-1.5 ${inputClass}`}
            >
              <option value="">Sélectionner…</option>
              {filieresFinales.map((f) => (
                <option key={f.code_filiere} value={f.code_filiere}>
                  {f.nom_filiere}
                  {f.niveau ? ` — Niveau ${f.niveau}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Année */}
          <div>
            <label htmlFor="annee" className="block text-sm font-medium text-gray-700">
              Année de session <span className="text-red-500">*</span>
            </label>
            <input
              id="annee"
              type="number"
              value={annee}
              onChange={(e) => { setAnnee(e.target.value); setState({}) }}
              min={1990}
              max={anneeActuelle}
              placeholder={String(anneeActuelle)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
        </div>
      </div>

      {/* Épreuves existantes */}
      {codeFiliere && anneeValide && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Déjà publiées pour {codeFiliere} — {annee}
          </p>
          {chargementEpreuves ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
            </div>
          ) : epreuves.length === 0 ? (
            <p className="text-sm italic text-gray-400">Aucune épreuve pour ce contexte.</p>
          ) : (
            <ul className="space-y-1">
              {epreuves.map((ep) => (
                <li key={ep.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {ep.matiere}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Étape 2 : Épreuves à publier */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          2 — Épreuves à publier{' '}
          <span className="normal-case font-normal text-gray-400">
            (PDF, {MAX_TAILLE_MO} Mo max)
          </span>
        </h3>

        <div key={lignesKey} className="space-y-3">
          {lignes.map((ligne, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto] items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-[1fr_1.4fr_auto]"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Matière {i === 0 && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={ligne.matiere}
                  onChange={(e) => setMatiere(i, e.target.value)}
                  placeholder="Ex : Mathématiques"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Fichier PDF {i === 0 && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFichier(i, e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-700 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200 transition"
                />
                {ligne.fichier && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {(ligne.fichier.size / (1024 * 1024)).toFixed(1)} Mo
                  </p>
                )}
              </div>

              <div className="pt-5">
                {lignes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => supprimerLigne(i)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Supprimer cette ligne"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {lignes.length < MAX_LIGNES && (
          <button
            type="button"
            onClick={ajouterLigne}
            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter une matière ({lignes.length}/{MAX_LIGNES})
          </button>
        )}
      </div>

      {/* Soumettre */}
      <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isPending || !peutSoumettre}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-6 py-3 text-base font-semibold text-white hover:bg-blue-900 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Publication en cours…</>
          ) : (
            <><Upload className="h-4 w-4" /> Publier {lignesRemplies.length > 1 ? `${lignesRemplies.length} épreuves` : "l'épreuve"}</>
          )}
        </button>
        {!peutSoumettre && !isPending && (
          <p className="text-sm text-gray-400">
            {!codeEcole
              ? 'Sélectionnez une école'
              : afficherNiveau && !niveau
              ? 'Sélectionnez un niveau'
              : !codeFiliere
              ? 'Sélectionnez une filière'
              : !anneeValide
              ? 'Saisissez une année valide'
              : 'Remplissez au moins une ligne'}
          </p>
        )}
      </div>
    </form>
  )
}
