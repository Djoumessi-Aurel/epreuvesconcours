'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

// Singleton : une seule instance GoTrue pour tout le navigateur.
// Évite la contention sur le Web Locks API auth token quand plusieurs
// composants appellent createClient() simultanément (ex : React Strict Mode).
let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}
