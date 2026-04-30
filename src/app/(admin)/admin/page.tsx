import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileCheck, Clock, XCircle, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ContributionCard } from '@/components/admin/ContributionCard'
import type { Database } from '@/types/database.types'

export const metadata = { title: 'Administration | Site Épreuves' }

const BUCKET = process.env.SUPABASE_BUCKET ?? 'site-epreuves'

export default async function AdminPage() {
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  // Contributions en attente avec pseudo du membre
  const { data: contributions } = await supabase
    .from('contributions')
    .select('*, profils(pseudo)')
    .order('created_at', { ascending: false })
    .limit(50) as { data: (Database['public']['Tables']['contributions']['Row'] & { profils: { pseudo: string } | null })[] | null }

  const enAttente = (contributions ?? []).filter((c) => c.statut === 'en_attente')
  const traitees = (contributions ?? []).filter((c) => c.statut !== 'en_attente')

  // Générer les URLs signées pour les fichiers en attente
  const urlsSignees: Record<number, string> = {}
  await Promise.all(
    enAttente.map(async (c) => {
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(`contributions/${c.storage_path}`, 600)
      if (data?.signedUrl) urlsSignees[c.id] = data.signedUrl
    })
  )

  const stats = {
    enAttente: enAttente.length,
    approuvees: (contributions ?? []).filter((c) => c.statut === 'approuvee').length,
    rejetees: (contributions ?? []).filter((c) => c.statut === 'rejetee').length,
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Administration</h1>
          <p className="mt-1 text-base text-gray-600">Gestion des contributions et des épreuves</p>
        </div>
        <Link
          href="/admin/epreuves/upload"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
        >
          <Upload className="h-4 w-4" /> Ajouter une épreuve
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <Clock className="h-8 w-8 shrink-0 text-amber-600" />
          <div>
            <p className="text-2xl font-bold text-amber-800">{stats.enAttente}</p>
            <p className="text-sm text-amber-700">En attente</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-5">
          <FileCheck className="h-8 w-8 shrink-0 text-green-600" />
          <div>
            <p className="text-2xl font-bold text-green-800">{stats.approuvees}</p>
            <p className="text-sm text-green-700">Approuvées</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-5">
          <XCircle className="h-8 w-8 shrink-0 text-red-500" />
          <div>
            <p className="text-2xl font-bold text-red-700">{stats.rejetees}</p>
            <p className="text-sm text-red-600">Rejetées</p>
          </div>
        </div>
      </div>

      {/* Contributions en attente */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Contributions en attente{' '}
          {enAttente.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm font-semibold text-amber-800">
              {enAttente.length}
            </span>
          )}
        </h2>
        {enAttente.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Aucune contribution en attente.
          </p>
        ) : (
          <div className="space-y-4">
            {enAttente.map((c) => (
              <ContributionCard
                key={c.id}
                contribution={{ ...c, pseudo: (c.profils as { pseudo: string } | null)?.pseudo }}
                signedUrl={urlsSignees[c.id]}
              />
            ))}
          </div>
        )}
      </section>

      {/* Historique */}
      {traitees.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Historique récent</h2>
          <div className="space-y-3">
            {traitees.slice(0, 10).map((c) => (
              <ContributionCard
                key={c.id}
                contribution={{ ...c, pseudo: (c.profils as { pseudo: string } | null)?.pseudo }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
