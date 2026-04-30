import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Client Supabase sans cookies — uniquement pour les requêtes publiques cachées.
 * N'utilise pas cookies() donc compatible avec 'use cache'.
 * Ne pas utiliser pour les opérations nécessitant l'identité de l'utilisateur.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
