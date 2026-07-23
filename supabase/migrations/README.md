# Migrations Supabase — état de la traçabilité

Ce dossier contient l'historique des migrations SQL du projet LPP. **Lis ceci
avant tout `supabase db push`, `migration repair`, ou reconstruction
d'environnement** : la traçabilité locale et la table de tracking distante
(`supabase_migrations.schema_migrations`) ne sont pas parfaitement alignées,
pour des raisons historiques documentées ci-dessous. Le schéma de production
est sain — c'est uniquement l'historique qui est incomplet.

## 1. Les fichiers `0001` → `0010` ne sont pas trackés en base

Les dix premières migrations (`0001_init` → `0010_calendrier_devoirs`, juin 2026)
ont été appliquées **à la main via le SQL Editor du dashboard Supabase**. Leur
schéma est bien présent en production, mais elles **n'ont jamais été
enregistrées** dans `supabase_migrations.schema_migrations`. Leur contenu n'est
pas perdu pour autant : ce sont les fichiers de ce dossier, complets.

La table de tracking distante ne contient donc que les migrations appliquées à
partir du 5 juillet 2026 (les fichiers `0011` et suivants, plus
`0015b_serie_c_to_d`), soit 13 entrées au moment de la rédaction.

## 2. Divergence de convention : `000N` en local, timestamp en base

- **Fichiers locaux** : préfixe séquentiel `000N` (`0011_emploi_du_temps_admin_write_policies.sql`).
- **Table de tracking distante** : versions horodatées
  (`20260705130137`, `20260705130407`, …), générées automatiquement par
  `mcp__supabase__apply_migration` / la CLI Supabase.

La correspondance entre un fichier local `0011`+ et son entrée distante se fait
**par nom de migration, pas par numéro de version** — les deux systèmes de
numérotation ne coïncident pas. Conséquence : un `supabase db push` naïf
considérerait les fichiers locaux comme non appliqués (aucune version `000N`
dans la table distante) et tenterait de tout rejouer, ce qui échouerait sur les
objets déjà existants. **Ne pas faire de `db push` sur la base de production
sans traiter d'abord ce point** (voir §4).

Note : le fichier `0015b_serie_c_to_d.sql` porte volontairement un suffixe `b`.
Il était initialement numéroté `0003` (collision avec `0003_admin_auth.sql`),
mais a en réalité été appliqué le 12 juillet, entre `0015_notifications` et
`0016_update_contact_email` (version distante `20260712222350`). Il a été
renommé pour refléter son ordre chronologique réel — contenu inchangé, jamais
réappliqué.

## 3. Règle go-forward : appliquer uniquement via MCP / CLI

À partir de maintenant, **toute nouvelle migration doit être appliquée via
`mcp__supabase__apply_migration` (ou `supabase migration up` / `db push` avec la
CLI)**, jamais à la main dans le SQL Editor. C'est ce qui garantit qu'elle est
enregistrée dans la table de tracking distante et reste cohérente entre
environnements. Les fichiers `0021_contacts_admin_update_policy` et
`0022_classes_1re_bep` suivent déjà cette règle : ils ont un fichier local **et**
une entrée distante.

Le fichier local reste la source de vérité lisible ; l'application via MCP/CLI
garantit qu'il est aussi tracké.

## 4. Reconstruction d'environnement (staging / DR) — action distincte, non exécutée

Si un jour il faut reconstruire un environnement (staging, reprise après
sinistre, nouveau projet Supabase) à partir de ces fichiers, les dix migrations
`0001` → `0010` devront être **marquées comme déjà appliquées** dans la table de
tracking, une fois vérifiées une à une, plutôt que rejouées :

```bash
supabase migration repair --status applied <version>
```

**Cette commande écrit dans `schema_migrations` : elle n'a volontairement PAS
été exécutée** lors de la remise en ordre documentaire de juillet 2026 (le but
était de reconstituer la traçabilité locale, pas de muter la base). Elle est à
n'envisager qu'au moment d'une reconstruction réelle, sous validation
explicite, en dehors des heures d'exploitation. Vérifier avant chaque `repair`
que l'objet concerné (table, contrainte, policy) existe bien déjà dans la base
cible, pour ne pas masquer une migration réellement manquante.
