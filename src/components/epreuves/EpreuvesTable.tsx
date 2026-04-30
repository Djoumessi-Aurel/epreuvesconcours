import { groupEpreuvesByAnnee } from '@/lib/queries/epreuves'
import type { EpreuveAvecUrl } from '@/lib/queries/epreuves'
import { DownloadButton } from './DownloadButton'

interface EpreuvesTableProps {
  epreuves: EpreuveAvecUrl[]
}

export function EpreuvesTable({ epreuves }: EpreuvesTableProps) {
  if (epreuves.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-600">
        Aucune épreuve disponible pour cette filière.
      </div>
    )
  }

  const parAnnee = groupEpreuvesByAnnee(epreuves)
  const annees = Object.keys(parAnnee)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      {annees.map((annee) => (
        <div key={annee} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-base font-bold text-gray-900">Session {annee}</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {parAnnee[annee].map((epreuve) => (
              <li
                key={epreuve.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors sm:flex-nowrap"
              >
                <span className="text-base text-gray-800">{epreuve.matiere}</span>
                <DownloadButton
                  url={epreuve.downloadUrl}
                  filename={`${epreuve.code_filiere} ${annee} ${epreuve.matiere}.pdf`}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
