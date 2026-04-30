import { createPublicClient } from '@/lib/supabase/public'
import type { Database } from '@/types/database.types'

export type Commentaire = Database['public']['Tables']['commentaires']['Row']

export async function getCommentairesByPage(codePage: string): Promise<Commentaire[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('commentaires')
    .select('*')
    .eq('code_page', codePage)
    .order('created_at', { ascending: true })
  return data ?? []
}
