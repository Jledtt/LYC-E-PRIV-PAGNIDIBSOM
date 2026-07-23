# AUDIT TECHNIQUE — LPP (Lycée Privé Pagnidibsom)

**Date :** 23 juillet 2026
**Périmètre :** code du dépôt `kiswensida` (master, commit `789bd67`) + base Supabase de production (`lwlapbrmiadqstsepspo`), inspectée via MCP (tables, policies RLS réelles, fonctions, migrations trackées, advisors).
**Méthode :** lecture seule. Aucune documentation projet n'a servi de source — uniquement `package.json`, le code, et l'état réel de la base.

---

## 1. État réel de la stack (constaté)

| Composant | Version constatée | Remarque |
|---|---|---|
| Next.js | **16.2.7** (App Router) | `middleware.ts` encore sur l'ancienne convention (cf. M-3) |
| React / React DOM | 19.2.4 | |
| TypeScript | ^5, `strict: true` | Aucun `any` implicite détecté ; assertions `as` ponctuelles mais encadrées |
| Tailwind CSS | v4 (`@tailwindcss/postcss`) | |
| @supabase/ssr | ^0.12.0 | + `@supabase/supabase-js` ^2.107.0 |
| Zod | ^4.4.3 | |
| Resend | ^6.12.4 | |
| @react-pdf/renderer | ^4.5.1 | 5 routes `/api/pdf/*`, runtime nodejs |
| ikoddi-client-sdk | ^1.1.5 | SMS (Burkina Faso) |
| Autres deps | react-markdown, remark-gfm, browser-image-compression | **Toutes consommées** — aucune dépendance inutilisée |

**Base Supabase :** 11 tables `public`, RLS activé sur **toutes**. 4 buckets Storage (`article-images` public, `dossier-pieces`, `photos-eleves`, `preuves-paiement` privés). Fonctions : `is_admin()`, `is_parent()` (SECURITY DEFINER, `search_path=public` — sain), `set_updated_at()` (trigger, `search_path` non fixé).

**Architecture d'accès aux données** (globalement saine et bien documentée dans `lib/supabase/server.ts`) :
- `createServerClient()` = service_role (bypass RLS), réservé en principe aux formulaires publics ;
- `createAuthClient()` = anon + cookies (RLS), pour admin et parent ;
- `createPublicClient()` = anon sans session (actualités, sitemap).

**Secrets :** aucun secret commité. `.env.local` absent de l'index git et de l'historique (`git log --diff-filter=A -- .env*` vide). `.env.example` ne contient que des placeholders.

---

## 2. Constats

### 🔴 CRITIQUE

#### C-1 — `getParentsDisponibles()` : fuite de l'annuaire complet des familles à tout utilisateur authentifié

**Fichier :** `app/admin/(dashboard)/notifications/actions.ts:35-63` → `lib/email/notifications.ts:56-124`

`getParentsDisponibles` est une Server Action exportée depuis un fichier `"use server"` — donc un endpoint POST invocable par quiconque possède son ID d'action, sans passer par l'UI admin. Contrairement à toutes les autres actions de ce fichier (`envoyerNotification`, `upsertModele`, `supprimerModele` appellent `getAdminUserId()`), **elle ne fait aucune vérification de rôle** et appelle `getDestinataires()` qui utilise `createServerClient()` (service_role, bypass RLS) et `auth.admin.getUserById()`.

**Impact concret :** n'importe quel compte parent (ou tout compte Google connecté via l'OAuth parent) peut récupérer, pour **toutes** les pré-inscriptions : nom/prénom de chaque élève, nom du parent, email (y compris l'email du compte Google rattaché, résolu via l'Auth Admin API), téléphone (parent, père ou mère). C'est une fuite de données personnelles d'enfants et de familles.

La deuxième requête de la fonction (`createAuthClient` sur `pre_inscriptions`) est filtrée par RLS, mais le mal est fait : le tableau retourné est construit à partir des données service_role (`classe` retombe simplement sur `"—"`).

**Fix proposé :** ajouter en tête de `getParentsDisponibles` le même garde que les actions sœurs :
```ts
const adminId = await getAdminUserId();
if (!adminId) return [];
```
**Effort :** ~15 min. Aucun risque de régression.

---

#### C-2 — `updateContactStatut()` : no-op silencieux — la policy UPDATE sur `contacts` n'existe pas

**Fichier :** `app/admin/(dashboard)/messages/actions.ts:9-29`
**Base :** table `public.contacts` — policies réelles constatées : **uniquement** `contacts_admin_select` (SELECT). Aucune policy UPDATE.

L'action passe par `createAuthClient()` (RLS). Sans policy UPDATE, PostgREST filtre silencieusement : **0 ligne modifiée, aucune erreur retournée**. L'action répond `{ success: true }`, `revalidatePath` s'exécute… et le statut revient à sa valeur d'origine au rechargement.

**Impact concret :** la fonctionnalité « marquer un message de contact comme traité » est **cassée en production** depuis sa mise en place, sans aucun signal d'erreur. Les admins peuvent croire des messages traités alors que rien n'est persisté.

**Fix proposé (2 volets) :**
1. Migration : `create policy contacts_admin_update on public.contacts for update to authenticated using (is_admin()) with check (is_admin());`
2. Dans l'action, ajouter `.select("id")` après le `.update()` et traiter `data.length === 0` comme un échec (le pattern existe déjà dans `app/admin/(dashboard)/dossiers/actions.ts:30-32` — c'est le bon modèle à généraliser, cf. I-2).

**Effort :** ~30 min (migration + action + test manuel).

---

### 🟠 IMPORTANT

#### I-1 — Routes `/api/pdf/*` : aucune authentification, service_role, et fuite du `dossier_token`

**Fichiers :** `app/api/pdf/pre-inscription/route.ts`, `carte-scolaire/route.ts`, `cartes-scolaires-lot/route.ts`, `emploi-du-temps/route.ts`, `calendrier-devoirs/route.ts`

Confirmé : les 5 routes n'ont **aucune** vérification d'auth et utilisent toutes `createServerClient()` (service_role). Données exposées à quiconque connaît (ou obtient) un UUID :

| Route | Garde | Données personnelles exposées |
|---|---|---|
| `GET /api/pdf/pre-inscription?id=<uuid>` | UUID | **Dossier complet** : identité et date/lieu de naissance de l'élève, ethnie, religion, **6 indicateurs de santé** (asthme, cardiopathie, diabète, drépanocytose, HTA, épilepsie), aptitude sport, identités/professions/téléphones/emails des deux parents, adresse, **et `dossier_token`** (route.ts:72) |
| `GET /api/pdf/carte-scolaire?id=<uuid>` | UUID | Identité, date/lieu de naissance, classe, téléphone d'urgence, **photo de l'enfant** (URL signée résolue côté serveur, incluse dans le PDF) |
| `POST /api/pdf/cartes-scolaires-lot` (`{ids: [...]}`)| UUIDs | Idem, en lot — accepte une liste arbitraire d'UUIDs |
| `GET /api/pdf/emploi-du-temps?classe=` | aucune | Non personnelles (EDT), mais la RLS exige `authenticated` pour ces mêmes données — la route contredit le modèle d'accès de la base |
| `GET /api/pdf/calendrier-devoirs?classe=&trimestre=` | aucune | Idem |

**Évaluation du risque réel :** un UUID v4 n'est pas devinable par force brute — le modèle « sécurité par UUID » tient tant que les UUIDs ne fuient pas. Mais ils circulent : dans l'email de notification admin (`dossierId`), dans `notifications_envoyees.destinataires_pre_inscription_ids`, dans les URLs admin (historique navigateur, logs). Surtout, **la route pre-inscription transforme une fuite d'UUID (lecture) en possession du `dossier_token` (écriture)** : le token donne accès à `/mon-dossier/{token}` et au dépôt de pièces. Enfin, la génération PDF est coûteuse en CPU (`@react-pdf/renderer`) sans rate-limit : vecteur d'abus de coût sur Vercel.

Point clé : la recherche des consommateurs (`grep /api/pdf`) montre que ces routes ne sont appelées **que depuis des espaces déjà authentifiés** (admin pour pre-inscription/cartes, admin + dashboard parent pour EDT/devoirs). L'absence d'auth n'est donc pas une nécessité fonctionnelle — c'est juste un manque.

**Fix proposé :**
- `pre-inscription`, `carte-scolaire`, `cartes-scolaires-lot` : exiger une session admin — `createAuthClient()` + vérification `profiles.role === 'admin'` en tête de handler (les cookies sont envoyés par `window.open`/`fetch` same-origin, aucun changement côté client). Basculer ensuite les requêtes sur ce même client authentifié (les policies `*_admin_select` couvrent tout ; seul `createSignedUrl` sur `photos-eleves` fonctionne aussi en RLS grâce à `photos_eleves_admin_select`).
- `emploi-du-temps`, `calendrier-devoirs` : exiger une session (admin **ou** parent) — simple `getUser()` non nul, puis client authentifié (`*_authenticated_select` couvre).
- Retirer `dossier_token` du SELECT de la route pre-inscription (il ne sert pas au PDF — vérifié : `PreInscriptionPDF` ne devrait pas en avoir besoin ; à confirmer dans le composant avant retrait).

**Effort :** ~2-3 h pour les 5 routes + tests manuels (admin, parent, non connecté).

---

#### I-2 — `updatePreInscriptionStatut()` : pas de garde admin, succès fantôme, et email de statut déclenchable par un parent

**Fichier :** `app/admin/(dashboard)/pre-inscriptions/actions.ts:39-82`

Contrairement à `updateClasseActuelle`, `updateContactUrgence` et `uploadPhotoEleve` (même fichier, garde `requireAdmin`), cette action s'appuie uniquement sur la RLS. Enchaînement problématique pour un **parent rattaché** qui l'invoque directement :

1. le SELECT préalable (l.51-55) **réussit** (policy `pre_inscriptions_parent_select`) ;
2. l'UPDATE (l.57) est filtré par RLS → 0 ligne, **aucune erreur** → l'action continue ;
3. si `existing.statut !== statut` et `parent_email` renseigné, **l'email « votre dossier est accepté/refusé » part réellement** (l.70-78) alors que rien n'a changé en base.

**Impact :** un parent peut se générer un faux email officiel « dossier accepté » (en-têtes et gabarit authentiques de l'école). Accessoirement, tout appel dont l'UPDATE ne matche rien renvoie `success: true` (fiabilité).

**Fix proposé :** ajouter `requireAdmin(authClient)` en tête (helper déjà présent dans le fichier, l.13-27) ; ajouter `.select("id")` sur l'UPDATE et échouer si 0 ligne ; n'envoyer l'email qu'après confirmation d'au moins 1 ligne modifiée. Généraliser le pattern « UPDATE + .select() + contrôle 0 ligne » à `updateContactStatut` (C-2), `updateClasseActuelle`, `updateContactUrgence`.
**Effort :** ~1 h.

---

#### I-3 — Migrations : dérive entre fichiers locaux et historique réel de la base

**Constaté :**
- 21 fichiers locaux `supabase/migrations/0001_*.sql` → `0020_*.sql`, dont **deux fichiers numérotés 0003** (`0003_admin_auth.sql` et `0003_serie_c_to_d.sql`) ;
- l'historique de migrations trackées côté Supabase ne contient que **11 entrées** (versions horodatées `20260705…` → `20260713…`), correspondant aux fichiers 0011→0020 + `serie_c_to_d`. **Les migrations 0001→0010 (init, auth admin, articles, dossier, auth parent, EDT, calendrier…) ne sont pas dans l'historique** — vraisemblablement appliquées à la main via le SQL Editor ;
- la numérotation locale (`0003_serie_c_to_d`) ne reflète pas l'ordre réel d'application (appliquée entre 0015 et 0016 selon l'horodatage remote).

Le schéma effectif de la base correspond bien au cumul des fichiers (vérifié sur les tables et policies), donc pas de bug actif — mais tout `supabase db push`/`migration repair` futur, ou toute reconstruction d'environnement (staging, projet de secours), échouera ou divergera silencieusement.

**Fix proposé :** sans rien appliquer aujourd'hui — (1) renommer `0003_serie_c_to_d.sql` avec un numéro libre reflétant l'ordre réel, (2) marquer les migrations 0001→0010 comme appliquées dans l'historique remote (`supabase migration repair --status applied`) après vérification une à une, (3) à partir de maintenant, ne plus rien appliquer hors CLI. Documenter la procédure.
**Effort :** ~2 h, à faire avec précaution (aucune modification de schéma, uniquement la table d'historique).

---

#### I-4 — Référentiel de classes incomplet : les élèves de 1re et BEP n'existent pas pour la « classe réelle »

**Fichiers/Base :** `lib/scolarite.ts:4-7` (`CLASSES` = CP1→CM2, 6e→3e, `2nde A`, `2nde D`) ; CHECK SQL identique sur `pre_inscriptions.classe_actuelle`, `emploi_du_temps.classe`, `calendrier_devoirs.classe`.

Or `classe_souhaitee` accepte `1re` et `BEP1-GC`/`BEP1-ET` (formulaire public + CHECK DB). Conséquence : pour un élève inscrit en 1re ou BEP, l'admin **ne peut jamais assigner de `classe_actuelle`** (`updateClasseActuelle` valide contre `CLASSES`, et le CHECK DB refuserait de toute façon). Sans `classe_actuelle` : pas d'emploi du temps ni de devoirs sur le dashboard parent (`app/parent/dashboard/page.tsx:186-213`), pas d'EDT/calendrier gérables pour ces classes, et la carte scolaire retombe sur `classe_souhaitee` (`buildCardContent.ts:56`).

Il manque aussi `1re A`/`1re D` dans les CHECK (la 2nde y est déclinée par série, pas la 1re) — l'établissement ouvre pourtant la 1re en 2026-2027 d'après le formulaire.

**Fix proposé :** migration élargissant les 3 CHECK (`1re A`, `1re D`, `BEP1-GC`, `BEP1-ET`) + même ajout dans `CLASSES` (`lib/scolarite.ts`), qui propage automatiquement aux selects admin, aux routes PDF et au dashboard. Vérifiable en re-générant les types.
**Effort :** ~1 h.

---

### 🟡 MOYEN

#### M-1 — Injection HTML dans les emails (aucun échappement des saisies utilisateur)

**Fichiers :** `actions/contact.ts:79-86` (nom, téléphone, email, message insérés bruts dans le HTML, seul `\n→<br>` est traité) ; `lib/email/templates.ts` (aucun `escapeHtml` dans tout le fichier — noms d'élève/parent interpolés directement, `contenuEnParagraphes` l.206-211 insère le contenu brut).

Un visiteur peut soumettre `<a href=…>`, `<img>`, ou du HTML de phishing dans le message de contact ou les noms de pré-inscription : il sera rendu tel quel dans la boîte de l'admin (et, pour les noms, dans les emails envoyés aux parents). Pas d'exécution de script dans un client mail moderne, mais vecteur de phishing crédible et de casse de mise en page.

**Fix proposé :** une fonction `escapeHtml()` unique (remplacement de `& < > " '`) appliquée à toute valeur interpolée dans `templates.ts` et `contact.ts`, avant la conversion `\n→<br>`.
**Effort :** ~1-2 h.

#### M-2 — Rate-limiting : en mémoire (non distribué) et absent sur deux actions authentifiées

**Fichier :** `lib/rate-limit.ts` — Map en mémoire par worker, limitation déjà documentée honnêtement en tête de fichier. Sur Vercel, chaque instance a son propre compteur ; avec Fluid Compute le compteur survit mais n'est pas partagé entre instances. Couverture actuelle : pré-inscription (8/20 min) ✔, contact (3/10 min) ✔, upload de pièce (10/10 min) ✔.

Manques : `declarerVirement` (`app/parent/paiement/actions.ts`) — un parent peut téléverser des justificatifs en boucle (remplissage du bucket `preuves-paiement`, upsert:false donc fichiers accumulés) ; `rattacherEleve` (`actions/parent-auth.ts`) — pas de limite sur les essais de token (risque théorique seulement : token 256 bits, force brute irréaliste). Les routes `/api/pdf/*` n'ont aucun rate-limit (traité avec I-1 : l'auth règle l'essentiel).

**Fix proposé :** court terme, appliquer `checkRateLimit` à `declarerVirement` (clé par `user.id`, pas par IP). Moyen terme (quand les effectifs croissent) : store distribué type `@upstash/ratelimit` — déjà prévu par le commentaire du fichier.
**Effort :** ~30 min (court terme).

#### M-3 — `middleware.ts` déprécié en Next.js 16 (→ `proxy.ts`)

**Fichiers :** `middleware.ts` (racine, 10 lignes) + `lib/supabase/middleware.ts` (`updateSession`, 97 lignes).

Next.js 16 renomme la convention `middleware` en `proxy` ; l'ancienne fonctionne encore mais est dépréciée et disparaîtra à la prochaine majeure. **Ampleur réelle : faible.** Le fichier racine est un simple délégué ; la migration = renommer `middleware.ts` → `proxy.ts`, exporter `proxy` au lieu de `middleware`, conserver le `config.matcher` tel quel. `lib/supabase/middleware.ts` n'a pas besoin de changer (son nom n'est qu'interne). **Risque principal :** c'est la pièce qui protège `/admin/*` et `/parent/*` et rafraîchit les sessions — tester soigneusement les redirections et le refresh de session après renommage (les commits récents montrent que cette zone a déjà été source de bugs subtils de refresh token).
**Effort :** ~30 min + une passe de tests manuels sérieuse sur login/refresh/redirects.

#### M-4 — Deux infrastructures email parallèles

**Fichiers :** `lib/email.ts` (client Resend ad hoc, `from: noreply@<hostname de NEXT_PUBLIC_SITE_URL>`, utilisé uniquement par `actions/contact.ts`) vs `lib/email/resend.ts` + `send.ts` + `templates.ts` (client partagé, `RESEND_FROM_EMAIL`, utilisé partout ailleurs).

Conséquences : deux expéditeurs potentiellement différents, le gabarit `wrapEmail` absent des emails de contact, et double maintenance. `lib/email/send.ts` contient par ailleurs 5 fonctions strictement identiques au nom du template près (~25 lignes dupliquées ×5).

**Fix proposé :** faire migrer `contact.ts` vers `lib/email/` (nouveau template `contactAdmin`), supprimer `lib/email.ts` ; optionnellement factoriser `send.ts` en un `sendEmail(template, to)` générique.
**Effort :** ~1-2 h.

#### M-5 — Duplication de code transverse

- `requireAdmin` / `getAdminUserId` réécrits dans 4 fichiers : `pre-inscriptions/actions.ts:13`, `emploi-du-temps/actions.ts:9`, `calendrier-devoirs/actions.ts:9`, `notifications/actions.ts:9` (+ variante inline dans `actualites/actions.ts` et `updateClasseActuelle`). À factoriser en `lib/require-admin.ts` — c'est aussi le prérequis des fixes C-1/I-1/I-2.
- `formatMontant` (XOF) dupliqué 3× : `app/admin/(dashboard)/paiements/page.tsx:39`, `app/parent/paiement/page.tsx:31`, `lib/email/templates.ts:236`. → `lib/format.ts`.
- `slugifyFilename` dupliqué dans 2 routes PDF (`pre-inscription/route.ts:10`, `carte-scolaire/route.ts:11`) alors que `lib/slugify.ts` existe déjà (implémentation quasi identique).
- Map `EXTENSIONS` (mime→ext) dupliquée : `app/mon-dossier/[token]/actions.ts:12` et `app/parent/paiement/actions.ts:15`.

**Effort :** ~2 h l'ensemble. Faible risque.

#### M-6 — Hygiène RLS/DB signalée par les advisors (vérifiée en base)

- **Policy dupliquée** : `parent_eleves_admin_select` et `parent_eleves_select_admin` sont deux policies identiques (`is_admin()`, SELECT). En supprimer une.
- **`auth_rls_initplan`** (6 policies) : `auth.uid()` réévalué par ligne dans `profiles_select_own`, `parent_eleves_select_own`, `pre_inscriptions_parent_select`, `dossier_pieces_parent_select`, `paiements_parent_select/insert`. Remplacer par `(select auth.uid())`. Impact négligeable à 8 pré-inscriptions, réel à quelques milliers de lignes.
- **FK non indexées** : `parent_eleves.pre_inscription_id`, `paiements.valide_par`, `notifications_envoyees.envoye_par/modele_id`, `dossier_pieces.piece_code`, `articles.author_id`. Les plus utiles : `parent_eleves.pre_inscription_id` (jointures RLS parent) et `dossier_pieces.pre_inscription_id` si absent.
- **Bucket `article-images`** : public **et** doté d'une policy SELECT large sur `storage.objects` → listing complet possible par n'importe qui. Contenu non sensible (couvertures d'articles), mais la policy de listing est inutile pour un bucket public : la supprimer.
- **`set_updated_at()`** sans `search_path` fixé (advisor) — aligner sur `is_admin`/`is_parent`.
- **`is_admin()`/`is_parent()` exécutables par `anon`** via `/rest/v1/rpc/` : fuite d'un booléen seulement, risque très faible ; `REVOKE EXECUTE ... FROM anon` par propreté.
- **Protection « leaked passwords » désactivée** dans Supabase Auth (les admins utilisent email/password) : à activer dans le dashboard.

**Effort :** une migration d'hygiène ~1-2 h.

#### M-7 — Envois en masse : ni pagination ni régulation

**Fichier :** `lib/email/notifications.ts` — `getDestinataires()` charge **toutes** les pré-inscriptions sans limite ; `resolveParentEmails` fait un `auth.admin.getUserById` **par parent** en `Promise.all` (N appels API) ; `envoyerEmails` tire un `resend.emails.send` par destinataire en `Promise.allSettled` simultané. À l'échelle de quelques centaines d'élèves : rafale d'appels qui dépassera le rate-limit de l'API Resend (des envois partiront en échec, correctement comptés mais échoués quand même).

**Fix proposé :** envoyer par lots (chunks de ~10 avec petite pause, ou API batch de Resend), et prévoir la pagination de `getDestinataires` quand les effectifs grossiront. Pas urgent au volume actuel — le signaler avant la première campagne « toute l'école ».
**Effort :** ~2 h.

#### M-8 — Divers fiabilité

- `uploadPhotoEleve` (`pre-inscriptions/actions.ts:181-183`) : l'ancienne photo est **supprimée avant** l'upload de la nouvelle ; si l'upload échoue ensuite, l'élève n'a plus de photo du tout. Inverser (upload nouveau chemin → update DB → remove ancien).
- Plusieurs `.delete()`/`.update()` admin ne vérifient que `error`, pas le nombre de lignes affectées (`emploi-du-temps/actions.ts:69`, `calendrier-devoirs/actions.ts:65`…) : un id inexistant ou un blocage RLS passe pour un succès. Même fix que I-2 (`.select("id")` + contrôle).
- `getClientIp` (`lib/rate-limit.ts:53-59`) prend la première valeur de `x-forwarded-for`. Sur Vercel cet en-tête est réécrit par la plateforme (non spoofable) — **non vérifiable depuis le code seul** ; si l'app quittait Vercel, ce serait contournable.

---

### 🟢 MINEUR

- **Code mort dans `config/site.ts`** : `siteConfig.cycles` (l.29-38) n'est consommé nulle part (le formulaire utilise `classeOptions`) ; `contact.mapLink` est une chaîne vide jamais lue. À supprimer.
- **`.env.example` incomplet** : manquent `RESEND_FROM_EMAIL`, `IKODDI_API_KEY`, `IKODDI_GROUP_ID`, `IKODDI_SENDER_ID` (tous lus par le code). Un déploiement neuf configuré depuis ce fichier perdrait les SMS sans erreur visible avant le premier envoi.
- **SVG de démo Next.js** dans `public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) : résidus du scaffolding, non référencés.
- **Pagination admin** : les pages `pre-inscriptions` et `dossiers` rendent un lien par page (`Array.from({length: totalPages})`) — illisible au-delà de ~20 pages. Cosmétique à l'échelle actuelle.
- **Emails séquentiels dans `submitPreInscription`** (`actions/pre-inscription.ts:182-203`) : deux `await` sériels ajoutent 1-2 s au temps de réponse du formulaire public. Un `Promise.all` suffirait.
- **Accessibilité des formulaires critiques : bonne.** Vérifié sur `PreInscriptionForm`/`ContactForm` : `noValidate` + validation serveur, `label htmlFor` systématique (`FormField`), `aria-invalid`, `aria-describedby` pointant vers les messages `role="alert"`. Rien de bloquant. Seule réserve : au retour d'erreurs serveur, pas de focus automatique sur le premier champ en erreur (confort clavier/lecteur d'écran).
- **`profiles` sans policy UPDATE** : personne (même l'admin) ne peut modifier `display_name` via RLS — cohérent avec le code actuel (écriture uniquement service_role au callback OAuth), à garder en tête si une page « profil » apparaît.

---

## 3. Ordre d'attaque recommandé

L'ordre tient compte des dépendances (le helper admin factorisé sert aux fixes suivants) et du ratio risque/effort :

1. **C-1** — garde admin sur `getParentsDisponibles` (15 min, fuite de données active). *Déployable seul, immédiatement.*
2. **C-2** — migration policy UPDATE `contacts` + contrôle 0-ligne (30 min, fonctionnalité cassée). Profiter de cette migration pour embarquer **M-6** (policy dupliquée, initplan, index FK, search_path, revoke anon) et **I-4** (élargissement des CHECK de classes) : une seule migration d'hygiène, testée d'un bloc.
3. **Factoriser `requireAdmin`** en `lib/require-admin.ts` (M-5, prérequis propre de la suite).
4. **I-2** — garde admin + contrôle lignes affectées sur `updatePreInscriptionStatut`, généralisé aux autres actions concernées (M-8).
5. **I-1** — authentification des 5 routes `/api/pdf/*` + retrait du `dossier_token` de la route pre-inscription. C'est le chantier sécurité le plus visible ; le faire après 3 pour réutiliser le helper.
6. **I-3** — réparation de l'historique de migrations (à faire avant toute future migration au-delà de celles du point 2 ; opération sur la table d'historique uniquement, en dehors des heures d'utilisation).
7. **M-1** — échappement HTML des emails.
8. **M-3** — renommage `middleware.ts` → `proxy.ts`, avec passe de tests manuels sur les sessions (à isoler dans un déploiement dédié pour pouvoir revenir en arrière facilement).
9. **M-4 / M-5 (reste) / M-2** — consolidation email, formatage XOF, rate-limit `declarerVirement`.
10. **M-7, MINEURS** — au fil de l'eau, avant la montée en charge (première campagne de notifications en masse, rentrée scolaire).

**Non recommandé :** toute réécriture d'architecture. Le socle (séparation des trois clients Supabase, RLS systématique, actions best-effort pour les emails, commentaires de code expliquant les pièges déjà rencontrés) est sain et visiblement durci par l'expérience — les problèmes relevés sont des trous ponctuels, pas des défauts de conception.

---

*Limites de l'audit : le contenu exact des fichiers de migration 0001→0010 n'a pas été diffé ligne à ligne contre le schéma remote (le schéma effectif a été vérifié globalement cohérent) ; le comportement de Vercel sur `x-forwarded-for` et la configuration du dashboard Supabase Auth (providers, protection mots de passe) sont constatés via advisors mais non testés en conditions réelles.*
