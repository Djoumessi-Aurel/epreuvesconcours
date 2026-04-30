'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import type { Ecole } from '@/lib/queries/ecoles'

interface Props {
  ecolesParType: Record<string, Ecole[]>
}

export function MobileNav({ ecolesParType }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const [categorieOuverte, setCategorieOuverte] = useState<string | null>(null)

  return (
    <div>
      <button
        onClick={() => setOuvert((v) => !v)}
        className="rounded-md p-2 text-gray-700 hover:bg-gray-100 active:bg-gray-200"
        aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={ouvert}
      >
        {ouvert ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {ouvert && (
        <>
          {/* Overlay pour fermer en cliquant dehors */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/20"
            onClick={() => setOuvert(false)}
            aria-hidden
          />
          <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white shadow-xl">
            <nav className="px-4 py-2" aria-label="Menu principal">
              {Object.entries(ecolesParType).map(([type, ecoles]) => (
                <div key={type} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => setCategorieOuverte((c) => (c === type ? null : type))}
                    className="flex w-full items-center justify-between py-3.5 text-base font-semibold text-gray-900"
                  >
                    {type}
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                        categorieOuverte === type ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {categorieOuverte === type && (
                    <ul className="mb-3 space-y-0.5">
                      {ecoles.map((ecole) => (
                        <li key={ecole.code_ecole}>
                          <Link
                            href={`/concours/${ecole.code_ecole}`}
                            onClick={() => setOuvert(false)}
                            className="flex items-baseline gap-2 rounded-md px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                          >
                            <span className="font-medium">{ecole.nom_reduit}</span>
                            <span className="text-sm text-gray-500 truncate">{ecole.nom_ecole}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
