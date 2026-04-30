import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Routes membres (connexion requise)
  // /contribuer est volontairement exclu : la page affiche elle-même un message si non connecté
  if (pathname.startsWith('/profil')) {
    if (!user) {
      return NextResponse.redirect(new URL('/connexion', request.url))
    }
  }

  // Routes admin/modérateur
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/connexion', request.url))
    }

    const { data: profil } = await supabase
      .from('profils')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()

    if (!profil || !['admin', 'moderateur'].includes(profil.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/profil/:path*',
    '/contribuer/:path*',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
