import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://epreuves-concours.aureldjoumessi.com'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Épreuves Concours Cameroun — ISSEA, EAMAC, ENSP, ENS, IFORD',
    template: '%s | Épreuves Concours Cameroun',
  },
  description:
    'Consultez et téléchargez gratuitement les annales des concours africains : ISSEA, EAMAC, ENSP Yaoundé, ENS Yaoundé, IFORD, EAMAU, Probatoire série D. Épreuves corrigées et non corrigées.',
  keywords: [
    'épreuves concours Cameroun', 'annales ISSEA', 'annales EAMAC', 'annales ENSP Yaoundé',
    'annales ENS Yaoundé', 'IFORD', 'EAMAU', 'Probatoire série D',
    'épreuves statistique', 'concours sous-région Afrique',
  ],
  authors: [{ name: 'Djoumessi Aurel' }],
  creator: 'Djoumessi Aurel',
  openGraph: {
    type: 'website',
    locale: 'fr_CM',
    url: APP_URL,
    siteName: 'Épreuves Concours Cameroun',
    title: 'Épreuves Concours Cameroun — ISSEA, EAMAC, ENSP, ENS, IFORD',
    description:
      'Annales des concours africains : ISSEA, EAMAC, ENSP Yaoundé, ENS, IFORD, EAMAU, Probatoire. Téléchargement gratuit.',
  },
  twitter: {
    card: 'summary',
    title: 'Épreuves Concours Cameroun',
    description: 'Annales des concours africains — téléchargement gratuit.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: APP_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
