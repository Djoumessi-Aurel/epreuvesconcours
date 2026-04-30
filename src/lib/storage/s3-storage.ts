// S3StorageProvider — activé quand STORAGE_PROVIDER=s3
// Nécessite : npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
import type { IStorageProvider, StorageFolder, UploadResult, SignedUrlResult } from './types'

const BUCKET = process.env.AWS_S3_BUCKET ?? 'site-epreuves'
const CDN_BASE = process.env.AWS_CLOUDFRONT_URL

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModule = any

export class S3StorageProvider implements IStorageProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any = null

  private async getClient() {
    if (this.client) return this.client
    const { S3Client } = await import(
      /* turbopackIgnore: true */
      /* webpackIgnore: true */
      '@aws-sdk/client-s3' as string
    ) as AnyModule
    this.client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    return this.client
  }

  private s3Key(folder: StorageFolder, path: string): string {
    return `${folder}/${path}`
  }

  async upload(
    folder: StorageFolder,
    path: string,
    file: File | Buffer,
    contentType: string,
    isPublic = false
  ): Promise<UploadResult> {
    const { PutObjectCommand } = await import(
      /* turbopackIgnore: true */
      /* webpackIgnore: true */
      '@aws-sdk/client-s3' as string
    ) as AnyModule
    const client = await this.getClient()
    const key = this.s3Key(folder, path)
    const body = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file

    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: isPublic ? 'public-read' : 'private',
      })
    )

    return { path, fullPath: `${BUCKET}/${key}`, publicUrl: isPublic ? this.getPublicUrl(folder, path) : undefined }
  }

  getPublicUrl(folder: StorageFolder, path: string): string {
    const key = this.s3Key(folder, path)
    if (CDN_BASE) return `${CDN_BASE}/${key}`
    return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  }

  async getSignedUrl(
    folder: StorageFolder,
    path: string,
    expiresInSeconds = 3600
  ): Promise<SignedUrlResult> {
    const [{ GetObjectCommand }, { getSignedUrl }] = await Promise.all([
      import(/* turbopackIgnore: true */ /* webpackIgnore: true */ '@aws-sdk/client-s3' as string) as Promise<AnyModule>,
      import(/* turbopackIgnore: true */ /* webpackIgnore: true */ '@aws-sdk/s3-request-presigner' as string) as Promise<AnyModule>,
    ])
    const client = await this.getClient()
    const signedUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: BUCKET, Key: this.s3Key(folder, path) }),
      { expiresIn: expiresInSeconds }
    )
    return { signedUrl, expiresAt: Math.floor(Date.now() / 1000) + expiresInSeconds }
  }

  async delete(folder: StorageFolder, path: string): Promise<void> {
    const { DeleteObjectCommand } = await import(
      /* turbopackIgnore: true */
      /* webpackIgnore: true */
      '@aws-sdk/client-s3' as string
    ) as AnyModule
    const client = await this.getClient()
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: this.s3Key(folder, path) }))
  }

  async exists(folder: StorageFolder, path: string): Promise<boolean> {
    const { HeadObjectCommand } = await import(
      /* turbopackIgnore: true */
      /* webpackIgnore: true */
      '@aws-sdk/client-s3' as string
    ) as AnyModule
    const client = await this.getClient()
    try {
      await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: this.s3Key(folder, path) }))
      return true
    } catch {
      return false
    }
  }
}
