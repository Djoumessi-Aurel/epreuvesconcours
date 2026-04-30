import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getFiliereByCode, getAllFilieres } from '@/lib/queries/filieres'
import { getEcoleByCode } from '@/lib/queries/ecoles'
import { getEpreuvesByFiliere } from '@/lib/queries/epreuves'
import { EpreuvesTable } from '@/components/epreuves/EpreuvesTable'
import { CommentairesList } from '@/components/commentaires/CommentairesList'

interface Props {
  params: Promise<{ codeFiliere: string }>
}

export async function generateStaticParams() {
  const filieres = await getAllFilieres()
  return filieres.map((f) => ({ codeFiliere: f.code_filiere }))
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://epreuves-concours.aureldjoumessi.com'

export async function generateMetadata({ params }: Props) {
  const { codeFiliere } = await params
  const filiere = await getFiliereByCode(codeFiliere)
  if (!filiere) return { title: 'Filière introuvable' }

  const title = `${filiere.nom_filiere} — Annales et épreuves`
  const description = `Téléchargez les annales de ${filiere.nom_filiere} : épreuves des années précédentes en PDF, gratuitement.`
  const url = `${APP_URL}/epreuves/${codeFiliere}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
  }
}

export default async function EpreuvesPage({ params }: Props) {
  'use cache'
  cacheLife('hours')

  const { codeFiliere } = await params
  const [filiere, epreuves] = await Promise.all([
    getFiliereByCode(codeFiliere),
    getEpreuvesByFiliere(codeFiliere),
  ])

  if (!filiere) notFound()

  const ecole = await getEcoleByCode(filiere.code_ecole)

  return (
    <div className="space-y-6">
      {/* Fil d'Ariane */}
      <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Fil d'Ariane">
        <Link href="/" className="text-gray-600 hover:text-gray-900">Accueil</Link>
        <span className="text-gray-300">/</span>
        {ecole && (
          <>
            <Link href={`/concours/${ecole.code_ecole}`} className="text-gray-600 hover:text-gray-900">
              {ecole.nom_reduit}
            </Link>
            <span className="text-gray-300">/</span>
          </>
        )}
        <span className="font-medium text-gray-800">{filiere.nom_filiere}</span>
      </nav>

      {/* En-tête filière */}
      <div>
        <Link
          href={`/concours/${filiere.code_ecole}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à {ecole?.nom_reduit ?? filiere.code_ecole}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{filiere.nom_filiere}</h1>
        {filiere.niveau && (
          <p className="mt-1.5 text-base text-gray-600">
            Niveau requis : <span className="font-medium">{filiere.niveau}</span>
          </p>
        )}
        <p className="mt-1 text-base text-gray-600">
          {epreuves.length} épreuve{epreuves.length > 1 ? 's' : ''} disponible{epreuves.length > 1 ? 's' : ''}
        </p>
      </div>

      <EpreuvesTable epreuves={epreuves} />

      {/* Commentaires — Client Component, chargement indépendant du cache */}
      <CommentairesList codePage={codeFiliere} />
    </div>
  )
}
