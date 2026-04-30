import type { IStorageProvider } from './types'

let instance: IStorageProvider | null = null

export function getStorageProvider(): IStorageProvider {
  if (instance) return instance

  const provider = process.env.STORAGE_PROVIDER ?? 'supabase'

  if (provider === 's3') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { S3StorageProvider } = require('./s3-storage')
    instance = new S3StorageProvider()
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseStorageProvider } = require('./supabase-storage')
    instance = new SupabaseStorageProvider()
  }

  return instance!
}
