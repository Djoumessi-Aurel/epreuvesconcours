import type { Metadata } from 'next'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ModifierPseudoForm } from '@/components/profil/ModifierPseudoForm'
import { ModifierMdpForm } from '@/components/profil/ModifierMdpForm'
import { PhotoProfilUpload } from '@/components/profil/PhotoProfilUpload'
import { deconnecter } from '@/lib/actions/auth.actions'
import type { Database } from '@/types/database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const BUCKET = process.env.SUPABASE_BUCKET ?? 'site-epreuves'

function photoUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/photos-profil/${storagePath}`
}

export const metadata: Metadata = { title: 'Mon profil | Site Épreuves' }

const roleLabel: Record<string, string> = {
  inscrit: 'Membre',
  moderateur: 'Modérateur',
  admin: 'Administrateur',
}

export default async function ProfilPage() {
  await connection()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profil } = await supabase
    .from('profils')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Database['public']['Tables']['profils']['Row'] | null }

  const dateInscription = profil?.date_inscription
    ? new Date(profil.date_inscription).toLocaleDateString('fr-FR', { dateStyle: 'long' })
    : '—'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Mon profil</h1>
        <p className="mt-1 text-base text-gray-600">Gérez vos informations personnelles</p>
      </div>

      {/* Infos du compte */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-gray-900">Informations du compte</h2>
        <dl className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="flex flex-1 flex-wrap gap-x-8 gap-y-0.5">
              <dt className="w-28 text-sm text-gray-600">Pseudo</dt>
              <dd className="font-medium text-gray-900">{profil?.pseudo ?? '—'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="flex flex-1 flex-wrap gap-x-8 gap-y-0.5">
              <dt className="w-28 text-sm text-gray-600">Email</dt>
              <dd className="font-medium text-gray-900 break-all">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="flex flex-1 flex-wrap gap-x-8 gap-y-0.5">
              <dt className="w-28 text-sm text-gray-600">Rôle</dt>
              <dd className="font-medium text-gray-900">
                {roleLabel[profil?.role ?? 'inscrit'] ?? profil?.role}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="flex flex-1 flex-wrap gap-x-8 gap-y-0.5">
              <dt className="w-28 text-sm text-gray-600">Inscrit le</dt>
              <dd className="font-medium text-gray-900">{dateInscription}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Photo de profil */}
      <PhotoProfilUpload
        photoUrl={photoUrl(profil?.photo_storage_path)}
        pseudo={profil?.pseudo ?? ''}
      />

      {/* Modifier pseudo */}
      <ModifierPseudoForm pseudoActuel={profil?.pseudo ?? ''} />

      {/* Modifier mot de passe */}
      <ModifierMdpForm />

      {/* Déconnexion */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-gray-900">Déconnexion</h2>
        <p className="mb-4 text-sm text-gray-600">Vous serez redirigé vers la page d&apos;accueil.</p>
        <form action={deconnecter}>
          <button
            type="submit"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}
