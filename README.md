# Pagnidibsom — Site vitrine (Phase 1)

Site web du collège-lycée Pagnidibsom à Ouagadougou, Burkina Faso.

**Stack :** Next.js 14+ · TypeScript · Tailwind CSS v4 · Supabase · Server Actions · Zod · Resend

---

## Prérequis

- Node.js 18+
- Un projet Supabase (gratuit : supabase.com)
- Un compte Resend (optionnel, pour les emails de notification)

---

## Installation

```bash
git clone <url-du-repo>
cd kiswensida
npm install
```

---

## Configuration des variables d'environnement

```bash
cp .env.example .env.local
```

Renseignez les valeurs dans `.env.local` :

| Variable | Description | Requis |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique du site | Oui |
| `SUPABASE_URL` | URL de votre projet Supabase | Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role Supabase (jamais exposée côté client) | Oui |
| `RESEND_API_KEY` | Clé API Resend pour les emails de notification | Non |
| `CONTACT_NOTIFICATION_EMAIL` | Email qui reçoit les notifications | Non |

> Sans `RESEND_API_KEY`, les emails sont simplement ignorés (log console). Le site fonctionne normalement.

---

## Configuration Supabase

### 1. Créer le projet Supabase
1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un nouveau projet.
2. Dans **Project Settings → API**, copiez :
   - `Project URL` → `SUPABASE_URL`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Appliquer la migration
1. Dans votre projet Supabase, ouvrez l'onglet **SQL Editor**.
2. Cliquez sur **New query**.
3. Copiez-collez le contenu de `supabase/migrations/0001_init.sql`.
4. Cliquez sur **Run**.

Cela crée les tables `pre_inscriptions` et `contacts` avec RLS activé.

---

## Lancement en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## Build de production

```bash
npm run build
npm start
```

---

## Déploiement sur Vercel

1. Poussez le projet sur GitHub (ou GitLab).
2. Sur [vercel.com](https://vercel.com), importez le dépôt.
3. Dans les paramètres du projet Vercel, ajoutez les variables d'environnement (section **Environment Variables**) :
   - `NEXT_PUBLIC_SITE_URL` = `https://votre-domaine.bf`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (optionnel)
   - `CONTACT_NOTIFICATION_EMAIL` (optionnel)
4. Cliquez sur **Deploy**.

> `SUPABASE_SERVICE_ROLE_KEY` est une variable serveur uniquement — ne la préfixez jamais de `NEXT_PUBLIC_`.

---

## Architecture du projet

```
app/                     Pages (App Router)
  page.tsx               Accueil
  ecole/                 Présentation de l'école
  formations/            Cycles collège & lycée
  admission/             Procédure d'admission
  pre-inscription/       Formulaire de pré-inscription
  contact/               Coordonnées + formulaire
  actualites/            Placeholder "Bientôt disponible"
  mentions-legales/      Page légale
  sitemap.ts             Sitemap XML automatique
  robots.ts              robots.txt

actions/                 Server Actions (jamais exposées côté client)
  pre-inscription.ts
  contact.ts

components/
  layout/                Header, Footer
  forms/                 Formulaires interactifs (Client Components)
  ui/                    Button, FormField, LogoSvg

config/
  site.ts                Configuration centrale (nom, couleurs, contacts)

content/
  accueil.ts             Textes de la page d'accueil
  ecole.ts               Textes de la page École
  formations.ts          Textes de la page Formations
  admission.ts           Textes de la page Admission

lib/
  supabase/server.ts     Client Supabase côté serveur
  email.ts               Wrapper Resend (no-op si clé absente)
  schemas.ts             Schémas Zod de validation

supabase/migrations/
  0001_init.sql          Migration SQL initiale
```

---

## Personnalisation du branding

Tout le branding est centralisé dans `config/site.ts` :
- Nom de l'école
- Tagline
- Coordonnées (adresse, téléphone, email)
- Liens réseaux sociaux
- Classes et séries proposées

Les textes de chaque page sont dans `content/*.ts`.

Le logo SVG est dans `components/ui/LogoSvg.tsx`.

---

## Étapes restantes (à charge du développeur)

1. **Supabase** : créer le projet et appliquer la migration SQL
2. **Variables d'environnement** : renseigner `.env.local`
3. **Contenu réel** : remplacer les placeholders dans `config/site.ts` et `content/*.ts`
4. **Logo** : remplacer `LogoSvg.tsx` par le vrai logo
5. **Domaine** : configurer le domaine dans Vercel et mettre à jour `NEXT_PUBLIC_SITE_URL`
6. **Resend** : créer un compte, vérifier le domaine d'envoi, ajouter la clé API
