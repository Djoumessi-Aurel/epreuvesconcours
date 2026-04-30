import { createClient } from '@supabase/supabase-js'
import type { IStorageProvider, StorageFolder, UploadResult, SignedUrlResult } from './types'

const BUCKET = process.env.SUPABASE_BUCKET ?? 'site-epreuves'

export class SupabaseStorageProvider implements IStorageProvider {
  private client

  constructor() {
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /** Chemin complet dans le bucket : "dossier/path" */
  private fullPath(folder: StorageFolder, path: string): string {
    return `${folder}/${path}`
  }

  async upload(
    folder: StorageFolder,
    path: string,
    file: File | Buffer,
    contentType: string,
    isPublic = false
  ): Promise<UploadResult> {
    const storagePath = this.fullPath(folder, path)

    const { data, error } = await this.client.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType, upsert: false })

    if (error) throw new Error(`Supabase upload error: ${error.message}`)

    const fullPath = `${BUCKET}/${data.path}`
    const publicUrl = isPublic ? this.getPublicUrl(folder, path) : undefined

    return { path, fullPath, publicUrl }
  }

  getPublicUrl(folder: StorageFolder, path: string): string {
    const { data } = this.client.storage
      .from(BUCKET)
      .getPublicUrl(this.fullPath(folder, path))
    return data.publicUrl
  }

  async getSignedUrl(
    folder: StorageFolder,
    path: string,
    expiresInSeconds = 3600
  ): Promise<SignedUrlResult> {
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(this.fullPath(folder, path), expiresInSeconds)

    if (error || !data) throw new Error(`Signed URL error: ${error?.message}`)

    return {
      signedUrl: data.signedUrl,
      expiresAt: Math.floor(Date.now() / 1000) + expiresInSeconds,
    }
  }

  async delete(folder: StorageFolder, path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(BUCKET)
      .remove([this.fullPath(folder, path)])
    if (error) throw new Error(`Delete error: ${error.message}`)
  }

  async exists(folder: StorageFolder, path: string): Promise<boolean> {
    const storagePath = this.fullPath(folder, path)
    const dir = storagePath.substring(0, storagePath.lastIndexOf('/'))
    const filename = storagePath.split('/').pop()
    const { data } = await this.client.storage.from(BUCKET).list(dir, { search: filename })
    return (data?.length ?? 0) > 0
  }
}
