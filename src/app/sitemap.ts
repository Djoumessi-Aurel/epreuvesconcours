import type { MetadataRoute } from 'next'
import { getEcoles } from '@/lib/queries/ecoles'
import { getAllFilieres } from '@/lib/queries/filieres'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://epreuves-concours.aureldjoumessi.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ecoles, filieres] = await Promise.all([getEcoles(), getAllFilieres()])

  const pagesStatiques: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${APP_URL}/connexion`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${APP_URL}/inscription`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  const pagesEcoles: MetadataRoute.Sitemap = ecoles.map((ecole) => ({
    url: `${APP_URL}/concours/${ecole.code_ecole}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const pagesFilieres: MetadataRoute.Sitemap = filieres.map((filiere) => ({
    url: `${APP_URL}/epreuves/${filiere.code_filiere}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  return [...pagesStatiques, ...pagesEcoles, ...pagesFilieres]
}
