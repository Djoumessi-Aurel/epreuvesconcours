'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { RoleMembre } from '@/types/database.types'

const roleBadge: Partial<Record<RoleMembre, { label: string; className: string }>> = {
  admin: {
    label: 'Admin',
    className: 'bg-red-100 text-red-800 border border-red-200',
  },
  moderateur: {
    label: 'Modo',
    className: 'bg-amber-100 text-amber-800 border border-amber-200',
  },
}

export function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [role, setRole] = useState<RoleMembre | null>(null)
  const [ouvert, setOuvert] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function chargerUtilisateur(userId: string) {
      const { data } = await supabase
        .from('profils')
        .select('role')
        .eq('id', userId)
        .single() as { data: { role: string } | null }
      setRole((data?.role as RoleMembre) ?? null)
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) chargerUtilisateur(data.user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        chargerUtilisateur(session.user.id)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleDeconnecter() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    setOuvert(false)
    router.refresh()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/connexion"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Connexion
        </Link>
        <Link
          href="/inscription"
          className="rounded-md bg-blue-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-900 transition-colors"
        >
          S&apos;inscrire
        </Link>
      </div>
    )
  }

  const badge = role ? roleBadge[role] : undefined
  const pseudo = user.user_metadata?.pseudo ?? user.email

  return (
    <div className="relative flex items-center gap-2">
      {/* Badge de rôle visible en permanence pour admin/modo */}
      {badge && (
        <span
          className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}
        >
          <ShieldCheck className="h-3 w-3" />
          {badge.label}
        </span>
      )}

      <button
        onClick={() => setOuvert(!ouvert)}
        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <User className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline max-w-28 truncate">{pseudo}</span>
        <ChevronDown className="h-4 w-4 shrink-0" />
      </button>

      {ouvert && (
        <>
          {/* Overlay pour fermer en cliquant dehors */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              // Ne fermer que si on clique en dehors du menu
              if (e.target === e.currentTarget) {
                setOuvert(false)
              }
            }}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* En-tête dropdown avec rôle */}
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-gray-900">{pseudo}</p>
              {badge && (
                <p className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
                  <ShieldCheck className="h-3 w-3" />
                  {badge.label}
                </p>
              )}
            </div>

            <Link
              href="/profil"
              onClick={() => setOuvert(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4" /> Mon profil
            </Link>
            <Link
              href="/contribuer"
              onClick={() => setOuvert(false)}
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Contribuer
            </Link>
            {role && ['admin', 'moderateur'].includes(role) && (
              <Link
                href="/admin"
                onClick={() => setOuvert(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Administration
              </Link>
            )}
            <hr className="my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation() // Empêcher la propagation au parent
                handleDeconnecter()
              }}
              disabled={pending}
              className="flex w-full items-center gap-2 rounded-b-lg px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {pending ? 'Déconnexion…' : 'Déconnexion'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
