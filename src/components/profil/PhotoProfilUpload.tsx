'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { Camera, CheckCircle, AlertCircle, Loader2, User } from 'lucide-react'
import { uploadPhotoProfile } from '@/lib/actions/profil.actions'
import type { ActionState } from '@/lib/actions/profil.actions'

interface Props {
  photoUrl: string | null
  pseudo: string
}

export function PhotoProfilUpload({ photoUrl, pseudo }: Props) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<ActionState>({})
  const [apercu, setApercu] = useState<string | null>(null)
  const [fichier, setFichier] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setFichier(file)
    setState({})
    if (file) {
      const url = URL.createObjectURL(file)
      setApercu(url)
    } else {
      setApercu(null)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fichier) return
    const formData = new FormData()
    formData.set('photo', fichier)

    startTransition(async () => {
      const result = await uploadPhotoProfile({}, formData)
      setState(result)
      if (result.success) {
        setFichier(null)
        setApercu(null)
        if (inputRef.current) inputRef.current.value = ''
      }
    })
  }

  const srcAffichee = apercu ?? photoUrl

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-gray-900">Photo de profil</h2>

      <form onSubmit={handleSubmit} className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {/* Avatar */}
        <div className="relative shrink-0">
          {srcAffichee ? (
            <Image
              src={srcAffichee}
              alt={`Photo de ${pseudo}`}
              width={96}
              height={96}
              priority
              className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-200"
              unoptimized={!!apercu}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 ring-2 ring-gray-200">
              <User className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full border border-gray-200 bg-white p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
            title="Changer la photo"
          >
            <Camera className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Contrôles */}
        <div className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFichier}
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Camera className="h-4 w-4" />
              {photoUrl ? 'Changer la photo' : 'Choisir une photo'}
            </button>

            {fichier && (
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-60"
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</>
                ) : (
                  'Enregistrer'
                )}
              </button>
            )}
          </div>

          {fichier && !state.success && (
            <p className="text-xs text-gray-500">{fichier.name} — {(fichier.size / 1024).toFixed(0)} Ko</p>
          )}

          <p className="text-xs text-gray-400">JPG, PNG ou WebP · 2 Mo maximum</p>

          {state.success && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4" /> {state.success}
            </p>
          )}
          {state.error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> {state.error}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
