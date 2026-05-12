'use client'

import { useEffect, useState } from 'react'
import { Eye, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | null }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-gray-700">
        {icon} {label}
      </span>
      <span className="text-base font-bold text-blue-800">
        {value === null ? <span className="inline-block h-4 w-8 animate-pulse rounded bg-gray-200" /> : value}
      </span>
    </li>
  )
}

export function Sidebar() {
  const [total, setTotal] = useState<number | null>(null)
  const [aujourdhui, setAujourdhui] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    supabase
      .from('visites')
      .select('nb_visites')
      .then(({ data }) => {
        setTotal((data ?? []).reduce((sum, r) => sum + r.nb_visites, 0))
      })

    supabase
      .from('visites')
      .select('nb_visites')
      .eq('jour', today)
      .maybeSingle()
      .then(({ data }) => {
        setAujourdhui(data?.nb_visites ?? 1)
      })
  }, [])

  return (
    <aside className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
          Statistiques
        </h3>
        <ul className="space-y-3">
          <StatItem
            icon={<Eye className="h-4 w-4 text-gray-500" />}
            label="Visites aujourd'hui"
            value={aujourdhui}
          />
          <StatItem
            icon={<Users className="h-4 w-4 text-gray-500" />}
            label="Visites totales"
            value={total}
          />
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
