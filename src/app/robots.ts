import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://epreuves-concours.aureldjoumessi.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/profil/', '/contribuer/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
