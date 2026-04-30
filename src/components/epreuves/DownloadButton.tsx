'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface Props {
  url: string
  filename: string
}

export function DownloadButton({ url, filename }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      // Fallback : ouvrir dans un nouvel onglet
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Téléchargement…</>
      ) : (
        <><Download className="h-4 w-4" /> Télécharger</>
      )}
    </button>
  )
}
