import { Eye, Users } from 'lucide-react'
import { getNbVisitesTotales, getNbVisitesAujourdhui } from '@/lib/queries/visites'

export async function Sidebar() {
  const [total, aujourdhui] = await Promise.all([
    getNbVisitesTotales(),
    getNbVisitesAujourdhui(),
  ])

  return (
    <aside className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
          Statistiques
        </h3>
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <Eye className="h-4 w-4 text-gray-500" /> Visites aujourd&apos;hui
            </span>
            <span className="text-base font-bold text-blue-800">{aujourdhui}</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-gray-500" /> Visites totales
            </span>
            <span className="text-base font-bold text-blue-800">{total}</span>
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-gray-800 leading-relaxed">
          Vous avez des épreuves à partager ?{' '}
          <a href="/contribuer" className="font-semibold text-blue-800 underline hover:text-blue-950">
            Contribuez ici
          </a>
        </p>
      </div>
    </aside>
  )
}
