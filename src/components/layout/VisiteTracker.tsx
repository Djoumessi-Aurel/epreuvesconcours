'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function VisiteTracker() {
  const pathname = usePathname()
  const dernierPathname = useRef<string | null>(null)

  useEffect(() => {
    if (pathname === dernierPathname.current) return
    dernierPathname.current = pathname

    fetch('/api/stats', { method: 'POST' })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          console.warn('[stats] échec:', res.status, body)
        }
      })
      .catch((err) => console.warn('[stats] réseau:', err))
  }, [pathname])

  return null
}
