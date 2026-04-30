export type StorageFolder = 'epreuves' | 'photos-profil' | 'contributions'

export interface UploadResult {
  /** chemin relatif au dossier (ex: "ISSEA-ISEmaths/2019/Sujets.pdf") */
  path: string
  /** chemin complet dans le bucket (ex: "epreuves/ISSEA-ISEmaths/2019/Sujets.pdf") */
  fullPath: string
  /** URL publique directe — uniquement pour le dossier 'epreuves' */
  publicUrl?: string
}

export interface SignedUrlResult {
  signedUrl: string
  expiresAt: number
}

export interface IStorageProvider {
  /**
   * Upload un fichier dans le dossier spécifié.
   * isPublic=true → génère une publicUrl dans le résultat (dossier 'epreuves' uniquement)
   */
  upload(
    folder: StorageFolder,
    path: string,
    file: File | Buffer,
    contentType: string,
    isPublic?: boolean
  ): Promise<UploadResult>

  /** URL publique permanente — uniquement pour 'epreuves' */
  getPublicUrl(folder: StorageFolder, path: string): string

  /** URL signée temporaire — pour 'photos-profil' et 'contributions' */
  getSignedUrl(
    folder: StorageFolder,
    path: string,
    expiresInSeconds?: number
  ): Promise<SignedUrlResult>

  delete(folder: StorageFolder, path: string): Promise<void>

  exists(folder: StorageFolder, path: string): Promise<boolean>
}
