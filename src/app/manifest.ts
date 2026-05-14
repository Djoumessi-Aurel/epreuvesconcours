import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Épreuves Concours',
    short_name: 'Épreuves Concours',
    description: 'Annales des concours et examens au Cameroun et dans la sous-région : ISSEA, EAMAC, ENSP, ENS, IFORD, EAMAU, etc.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    lang: 'fr',
    orientation: 'portrait',
    categories: ['education'],
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'ISSEA',
        url: '/concours/ISSEA',
        description: 'Épreuves ISSEA',
      },
      {
        name: 'EAMAC',
        url: '/concours/EAMAC',
        description: 'Épreuves EAMAC',
      },
    ],
  }
}
