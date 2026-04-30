'use client'

import { useActionState, useState } from 'react'
import { XCircle, FileText, User, Calendar, ChevronDown, ChevronUp, ExternalLink, CheckCircle } from 'lucide-react'
import { rejeterContribution } from '@/lib/actions/admin.actions'
import type { AdminActionState } from '@/lib/actions/admin.actions'
import { formatRelative } from '@/lib/utils/format-date'
import { DownloadButton } from '@/components/epreuves/DownloadButton'
import { ApprobationForm } from './ApprobationForm'
import type { Database } from '@/types/database.types'

type Contribution = Database['public']['Tables']['contributions']['Row'] & {
  pseudo?: string | null
}

interface Props {
  contribution: Contribution
  signedUrl?: string
}

export function ContributionCard({ contribution, signedUrl }: Props) {
  const [rejeterState, rejeterAction, rejeterPending] = useActionState(
    rejeterContribution,
    {} as AdminActionState
  )
  const [approuverOuvert, setApprouverOuvert] = useState(false)
  const [rejeterOuvert, setRejeterOuvert] = useState(false)

  const estTraitee = contribution.statut !== 'en_attente'

  return (
    <div className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
      estTraitee ? 'opacity-60' : 'border-gray-200'
    }`}>
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate font-medium text-gray-900">{contribution.nom_fichier}</span>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          contribution.statut === 'en_attente'
            ? 'bg-amber-100 text-amber-800'
            : contribution.statut === 'approuvee'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-700'
        }`}>
          {contribution.statut === 'en_attente' ? 'En attente'
            : contribution.statut === 'approuvee' ? 'Approuvée' : 'Rejetée'}
        </span>
      </div>

      <div className="space-y-3 px-5 py-4">
        {/* Métadonnées */}
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {contribution.pseudo ?? 'Anonyme'}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatRelative(contribution.created_at)}
          </span>
        </div>

        {/* Description */}
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {contribution.details}
        </p>

        {/* Aperçu + téléchargement */}
        {signedUrl && (
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-800 hover:underline"
            >
              <ExternalLink className="h-4 w-4" /> Ouvrir le fichier
            </a>
            <DownloadButton url={signedUrl} filename={contribution.nom_fichier} />
          </div>
        )}

        {/* Note modérateur (si rejetée) */}
        {contribution.note_moderateur && (
          <p className="text-sm italic text-red-600">Note : {contribution.note_moderateur}</p>
        )}

        {/* Feedback rejet */}
        {(rejeterState.success || rejeterState.error) && (
          <p className={`text-sm font-medium ${rejeterState.success ? 'text-green-700' : 'text-red-600'}`}>
            {rejeterState.success ?? rejeterState.error}
          </p>
        )}

        {/* Actions (contributions en attente uniquement) */}
        {!estTraitee && (
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap gap-3">

              {/* Approuver */}
              <button
                type="button"
                onClick={() => { setApprouverOuvert((v) => !v); setRejeterOuvert(false) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Approuver
                {approuverOuvert ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {/* Rejeter */}
              <button
                type="button"
                onClick={() => { setRejeterOuvert((v) => !v); setApprouverOuvert(false) }}
                disabled={rejeterPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                Rejeter
                {rejeterOuvert ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Formulaire d'approbation */}
            {approuverOuvert && (
              <ApprobationForm contributionId={contribution.id} />
            )}

            {/* Formulaire de rejet */}
            {rejeterOuvert && (
              <form action={rejeterAction} className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
                <input type="hidden" name="id" value={contribution.id} />
                <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                  Motif du rejet
                </p>
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Expliquer pourquoi la contribution est rejetée (optionnel)"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
                <button
                  type="submit"
                  disabled={rejeterPending}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {rejeterPending ? 'Rejet…' : 'Confirmer le rejet'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
