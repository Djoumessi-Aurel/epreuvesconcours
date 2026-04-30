import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { ArrowRight, BookOpen, Upload, MessageSquare } from 'lucide-react'
import { Suspense } from 'react'
import { getEcolesParType } from '@/lib/queries/ecoles'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { VisiteTracker } from '@/components/layout/VisiteTracker'

export default async function HomePage() {
  'use cache'
  cacheLife('hours')

  const ecolesParType = await getEcolesParType()
  const types = Object.keys(ecolesParType)

  return (
    <div className="flex min-h-screen flex-col">
      <VisiteTracker />
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start">
        <main className="min-w-0 flex-1 space-y-10">
          {/* Hero */}
          <section className="rounded-xl bg-linear-to-br from-blue-800 to-blue-900 p-8 text-white sm:p-10">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Épreuves de concours - Cameroun et sous-région
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
              Retrouvez les anciennes épreuves des grandes écoles et concours sous-régionaux :
              ISSEA, EAMAC, ENSP, ENS, IFORD, EAMAU et plus encore.
            </p>
            <Link
              href="/contribuer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50 transition-colors"
            >
              <Upload className="h-4 w-4" /> Partager des épreuves
            </Link>
          </section>

          {/* Écoles par type */}
          {types.map((type) => (
            <section key={type}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">{type}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ecolesParType[type].map((ecole) => (
                  <Link
                    key={ecole.code_ecole}
                    href={`/concours/${ecole.code_ecole}`}
                    className="group flex min-w-0 overflow-hidden items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-900">
                        {ecole.nom_reduit}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600 wrap">
                        {ecole.nom_ecole}
                      </p>
                    </div>
                    <ArrowRight className="ml-2 h-5 w-5 shrink-0 text-gray-400 group-hover:text-blue-700 transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {/* Features */}
          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: BookOpen, titre: 'Épreuves officielles', desc: '258+ épreuves classées par école, filière et année' },
              { icon: Upload, titre: 'Contribuez', desc: 'Partagez vos épreuves pour aider la communauté' },
              { icon: MessageSquare, titre: 'Commentaires', desc: 'Échangez et posez vos questions sur chaque filière' },
            ].map(({ icon: Icon, titre, desc }) => (
              <div key={titre} className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <Icon className="h-6 w-6 text-blue-800" />
                <h3 className="mt-3 text-base font-semibold text-gray-900">{titre}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </section>
        </main>

        <aside className="w-full lg:w-64 lg:shrink-0">
          <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-gray-100" />}>
            <Sidebar />
          </Suspense>
        </aside>
      </div>

      <Footer />
    </div>
  )
}
