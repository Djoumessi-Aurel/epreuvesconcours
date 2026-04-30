import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(): Promise<NextResponse> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      console.error('[stats] Variables Supabase manquantes')
      return NextResponse.json({ ok: false, reason: 'config' }, { status: 500 })
    }

    const supabase = createClient(url, key)
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase.rpc('incrementer_visite', { p_jour: today })

    if (error) {
      console.error('[stats] Erreur RPC incrementer_visite:', error.message, error.code)
      return NextResponse.json({ ok: false, reason: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[stats] Erreur inattendue:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
