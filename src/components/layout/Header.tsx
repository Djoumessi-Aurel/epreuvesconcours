import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { NavMenu } from './NavMenu'
import { MobileNav } from './MobileNav'
import { UserMenu } from './UserMenu'
import { getEcolesParType } from '@/lib/queries/ecoles'

export async function Header() {
  const ecolesParType = await getEcolesParType()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-blue-900 shrink-0">
          <BookOpen className="h-6 w-6" />
          <span className="text-base">Site Épreuves</span>
        </Link>

        {/* Navigation desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavMenu ecolesParType={ecolesParType} />
        </div>

        <div className="flex items-center gap-1">
          <UserMenu />
          {/* Hamburger mobile */}
          <div className="md:hidden">
            <MobileNav ecolesParType={ecolesParType} />
          </div>
        </div>
      </div>
    </header>
  )
}
