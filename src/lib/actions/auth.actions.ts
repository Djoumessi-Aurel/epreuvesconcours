'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; success?: string }

export async function inscrire(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const pseudo = (formData.get('pseudo') as string)?.trim()
  const email = formData.get('email') as string
  const motDePasse = formData.get('motDePasse') as string
  const confirmation = formData.get('confirmation') as string

  if (!pseudo || pseudo.length < 3) {
    return { error: 'Le pseudo doit contenir au moins 3 caractères.' }
  }
  if (motDePasse !== confirmation) {
    return { error: 'Les mots de passe ne correspondent pas.' }
  }
  if (motDePasse.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: {
      data: { pseudo },
    },
  })

  if (error) {
    return { error: "Erreur lors de l'inscription. Réessayez." }
  }

  // Quand la confirmation email est activée, Supabase ne retourne pas d'erreur
  // pour un email déjà utilisé — il retourne un user avec identities[] vide.
  if (!data.user || data.user.identities?.length === 0) {
    return { error: 'Cette adresse email est déjà utilisée.' }
  }

  redirect('/connexion?inscrit=1')
}

export async function connecter(formData: FormData): Promise<never> {
  const email = formData.get('email') as string
  const motDePasse = formData.get('motDePasse') as string
  const next = (formData.get('next') as string)?.trim() ?? ''

  // Validation anti-open-redirect : uniquement les chemins internes
  const destination = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  })

  if (error) {
    const params = next ? `?erreur=1&next=${encodeURIComponent(next)}` : '?erreur=1'
    redirect(`/connexion${params}`)
  }

  redirect(destination)
}

export async function deconnecter(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
