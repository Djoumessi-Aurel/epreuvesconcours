'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Ecole } from '@/lib/queries/ecoles'

interface NavMenuProps {
  ecolesParType: Record<string, Ecole[]>
}

export function NavMenu({ ecolesParType }: NavMenuProps) {
  const [ouvert, setOuvert] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const types = Object.keys(ecolesParType)

  const handleMouseEnter = (type: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOuvert(type)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOuvert(null)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <nav className="flex items-center gap-1" aria-label="Navigation principale">
      {types.map((type) => (
        <div
          key={type}
          className="relative"
          onMouseEnter={() => handleMouseEnter(type)}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => setOuvert(ouvert === type ? null : type)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            {type}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${ouvert === type ? 'rotate-180' : ''}`}
            />
          </button>

          {ouvert === type && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
              {ecolesParType[type].map((ecole) => (
                <Link
                  key={ecole.code_ecole}
                  href={`/concours/${ecole.code_ecole}`}
                  onClick={() => setOuvert(null)}
                  className="flex items-baseline gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="font-medium">{ecole.nom_reduit}</span>
                  <span className="text-sm text-gray-500">{ecole.nom_ecole}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
