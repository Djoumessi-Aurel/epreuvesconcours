import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { getEcoleByCode, getEcoles } from '@/lib/queries/ecoles'
import { getFilieresByEcole } from '@/lib/queries/filieres'

interface Props {
  params: Promise<{ codeEcole: string }>
}

export async function generateStaticParams() {
  const ecoles = await getEcoles()
  return ecoles.map((e) => ({ codeEcole: e.code_ecole }))
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://epreuves-concours.aureldjoumessi.com'

export async function generateMetadata({ params }: Props) {
  const { codeEcole } = await params
  const ecole = await getEcoleByCode(codeEcole)
  if (!ecole) return { title: 'École introuvable' }

  const title = `${ecole.nom_reduit} — Filières et épreuves`
  const description = `Toutes les filières et annales du concours ${ecole.nom_ecole}. Téléchargez gratuitement les épreuves des années précédentes.`
  const url = `${APP_URL}/concours/${codeEcole}`

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

export default async function ConcoursPage({ params }: Props) {
  'use cache'
  cacheLife('hours')

  const { codeEcole } = await params
  const [ecole, filieres] = await Promise.all([
    getEcoleByCode(codeEcole),
    getFilieresByEcole(codeEcole),
  ])

  if (!ecole) notFound()

  return (
    <div className="space-y-6">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Fil d'Ariane">
        <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-800">{ecole.nom_reduit}</span>
      </nav>

      {/* En-tête école */}
      <div>
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {ecole.type_concours}
        </span>
        <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">{ecole.nom_ecole}</h1>
        <p className="mt-1.5 text-base text-gray-600">
          {filieres.length} filière{filieres.length > 1 ? 's' : ''} disponible{filieres.length > 1 ? 's' : ''}
        </p>
      </div>

      {filieres.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600">
          Aucune filière disponible pour cette école.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filieres.map((filiere) => (
            <Link
              key={filiere.code_filiere}
              href={`/epreuves/${filiere.code_filiere}`}
              className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-blue-900">
                  {filiere.nom_filiere}
                </p>
                {filiere.niveau && (
                  <p className="mt-0.5 text-sm text-gray-600">Niveau : {filiere.niveau}</p>
                )}
              </div>
              <ArrowRight className="ml-2 h-5 w-5 shrink-0 text-gray-400 group-hover:text-blue-700 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
