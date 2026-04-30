// Généré par : npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
// Ce fichier est un placeholder — le remplacer après avoir créé le projet Supabase

export type RoleMembre = 'inscrit' | 'moderateur' | 'admin'
export type StatutContribution = 'en_attente' | 'approuvee' | 'rejetee'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ecoles: {
        Row: {
          id: number
          nom_ecole: string
          nom_reduit: string
          code_ecole: string
          type_concours: string
        }
        Insert: {
          nom_ecole: string
          nom_reduit: string
          code_ecole: string
          type_concours: string
        }
        Update: {
          nom_ecole?: string
          nom_reduit?: string
          code_ecole?: string
          type_concours?: string
        }
        Relationships: []
      }
      filieres: {
        Row: {
          id: number
          code_ecole: string
          nom_filiere: string
          niveau: string
          code_filiere: string
        }
        Insert: {
          code_ecole: string
          nom_filiere: string
          niveau: string
          code_filiere: string
        }
        Update: {
          code_ecole?: string
          nom_filiere?: string
          niveau?: string
          code_filiere?: string
        }
        Relationships: []
      }
      epreuves: {
        Row: {
          id: number
          code_filiere: string
          annee: number
          matiere: string
          storage_path: string
        }
        Insert: {
          code_filiere: string
          annee: number
          matiere: string
          storage_path: string
        }
        Update: {
          code_filiere?: string
          annee?: number
          matiere?: string
          storage_path?: string
        }
        Relationships: []
      }
      profils: {
        Row: {
          id: string
          pseudo: string
          role: RoleMembre
          date_inscription: string
          photo_storage_path: string | null
        }
        Insert: {
          id: string
          pseudo: string
          role?: RoleMembre
          photo_storage_path?: string | null
        }
        Update: {
          id?: string
          pseudo?: string
          role?: RoleMembre
          photo_storage_path?: string | null
        }
        Relationships: []
      }
      commentaires: {
        Row: {
          id: number
          auteur_nom: string
          id_membre: string | null
          code_page: string
          id_parent: number | null
          contenu: string
          created_at: string
        }
        Insert: {
          auteur_nom: string
          id_membre?: string | null
          code_page: string
          id_parent?: number | null
          contenu: string
        }
        Update: {
          auteur_nom?: string
          id_membre?: string | null
          code_page?: string
          id_parent?: number | null
          contenu?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          id: number
          id_membre: string | null
          details: string
          storage_path: string
          nom_fichier: string
          statut: StatutContribution
          note_moderateur: string | null
          created_at: string
          traite_at: string | null
        }
        Insert: {
          id_membre?: string | null
          details: string
          storage_path: string
          nom_fichier: string
        }
        Update: {
          id?: number
          id_membre?: string | null
          details?: string
          storage_path?: string
          nom_fichier?: string
          statut?: StatutContribution
          note_moderateur?: string | null
          traite_at?: string | null
        }
        Relationships: []
      }
      visites: {
        Row: {
          jour: string
          nb_visites: number
        }
        Insert: {
          jour: string
          nb_visites: number
        }
        Update: {
          jour?: string
          nb_visites?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: RoleMembre
      }
      incrementer_visite: {
        Args: { p_jour: string }
        Returns: undefined
      }
    }
    Enums: {
      role_membre: RoleMembre
      statut_contribution: StatutContribution
    }
    CompositeTypes: Record<string, never>
  }
}
