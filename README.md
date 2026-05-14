# Site Épreuves Concours

Plateforme communautaire de partage d'annales de concours et examens camerounais (ISSEA, ENSPY, ENS Yaoundé, EAMAC, EAMAU, IFORD, etc.).

Refonte complète d'un site PHP vers une stack moderne : **Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · Vercel**.

---

## Fonctionnalités

- Consultation et téléchargement d'épreuves PDF par école, filière et année
- Commentaires publics (avec réponses imbriquées)
- Espace membre : inscription, connexion, profil, photo de profil
- Contribution d'épreuves par les membres (soumis à modération)
- Interface d'administration : validation/rejet des contributions, upload direct d'épreuves, gestion CRUD des écoles et filières
- PWA installable (manifest + service worker) avec cache offline des PDFs

## Stack technique

| Couche         | Technologie                          |
| -------------- | ------------------------------------ |
| Framework      | Next.js 16.2.3 (App Router)          |
| Langage        | TypeScript 5                         |
| Style          | Tailwind CSS v4                      |
| Backend / Auth | Supabase (Postgres + Auth + Storage) |
| Hébergement    | Vercel                               |

## Prérequis

- Node.js 20+
- Un projet Supabase (gratuit)
- Un compte Vercel (pour le déploiement)

## Installation

```bash
git clone <repo>
cd site-epreuves
npm install
```

Copiez `.env.example` en `.env.local` et renseignez les variables :

```bash
cp .env.example .env.local
```

## Variables d'environnement

```bash
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # jamais exposé côté client

# Nom du bucket Supabase Storage
SUPABASE_BUCKET=site-epreuves

# Storage provider : 'supabase' (défaut) ou 's3'
STORAGE_PROVIDER=supabase

# AWS S3 (uniquement si STORAGE_PROVIDER=s3)
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_EPREUVES=
AWS_S3_BUCKET_PROFIL=
AWS_S3_BUCKET_CONTRIBUTIONS=
AWS_CLOUDFRONT_URL=

# Application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
ADMIN_EMAIL=
```

## Configuration Supabase

### 1. Base de données

Exécutez les migrations dans l'ordre dans le **SQL Editor** de Supabase :

```text
supabase/migrations/001_initial_schema.sql   ← schéma + RLS
supabase/migrations/002_storage_policies.sql ← politiques storage
supabase/seed.sql                            ← données initiales (écoles, filières)
```

### 2. Storage

Créez un bucket nommé `site-epreuves` (type **Public**) dans Storage > Buckets.

Les trois dossiers (`epreuves/`, `contributions/`, `photos-profil/`) sont créés automatiquement au premier upload.

### 3. Auth

Dans Authentication > Settings :

- **Site URL** : `https://votre-domaine.com`
- **Redirect URLs** : `https://votre-domaine.com/api/auth/callback`

## Lancement en développement

```bash
npm run dev
```

Accédez à [http://localhost:3000](http://localhost:3000).

## Déploiement sur Vercel

```bash
npm run build   # vérification locale avant deploy
```

Puis connectez le dépôt à Vercel et configurez les variables d'environnement dans le dashboard Vercel (Settings > Environment Variables).

## Structure des dossiers

```text
src/
├── app/
│   ├── (public)/          # pages publiques (accueil, concours, épreuves)
│   ├── (auth)/            # connexion, inscription
│   ├── (membre)/          # profil, contribuer (connexion requise)
│   └── (admin)/           # dashboard admin (admin/modérateur requis)
├── components/
│   ├── layout/            # Header, Footer, NavMenu, UserMenu
│   ├── epreuves/          # tableau épreuves, bouton téléchargement
│   ├── commentaires/      # liste, formulaire, réponses
│   ├── contribuer/        # formulaire d'upload multi-fichiers
│   ├── profil/            # modification pseudo, mdp, photo
│   └── admin/             # modération contributions, upload épreuves
└── lib/
    ├── actions/           # Server Actions (auth, profil, commentaires, admin)
    ├── queries/           # requêtes Supabase (Server Components)
    └── supabase/          # clients server, browser, middleware
```

## Commandes utiles

```bash
npm run dev      # serveur de développement
npm run build    # build de production
npm run lint     # vérification ESLint

# Générer les types TypeScript depuis le schéma Supabase
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

## Convention de nommage des fichiers

Les épreuves sont stockées selon la convention :

```text
epreuves/{CODE_FILIERE}/{code_filiere} {annee} {matiere}.pdf
```

Exemple : `epreuves/ITSA/itsa 2015 mathematiques et statistique.pdf`

## Crédits

Copyright (c) 2026 Djoumessi Aurel