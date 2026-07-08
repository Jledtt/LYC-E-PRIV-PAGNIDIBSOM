-- Migration : Pagnidibsom — système de notifications multicanal (Email + SMS)
-- Modèles de messages prédéfinis (modifiables) + historique des envois.

create table modeles_messages (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  sujet text not null,
  contenu text not null,
  type text not null check (type in ('masse', 'convocation', 'avertissement', 'reunion', 'autre')),
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table modeles_messages enable row level security;
create policy "admin_all" on modeles_messages for all using (is_admin());

insert into modeles_messages (nom, sujet, contenu, type, is_default) values
(
  'Réunion parents d''élèves',
  'Réunion des parents d''élèves — Lycée Privé Pagnidibsom',
  'Cher(e) parent/tuteur,

Nous avons l''honneur de vous convoquer à une réunion des parents d''élèves qui se tiendra le [DATE] à [HEURE] dans les locaux du Lycée Privé Pagnidibsom.

Votre présence est vivement souhaitée.

Cordialement,
La Direction — Lycée Privé Pagnidibsom',
  'reunion', true
),
(
  'Convocation pour discipline',
  'Convocation — Lycée Privé Pagnidibsom',
  'Cher(e) parent/tuteur de [NOM_ELEVE],

Nous vous prions de bien vouloir vous présenter au bureau du proviseur le [DATE] à [HEURE] concernant le comportement de votre enfant.

Merci de confirmer votre présence au +226XXXXXXXX.

Cordialement,
La Direction — Lycée Privé Pagnidibsom',
  'convocation', true
),
(
  'Avertissement de travail',
  'Avertissement — Lycée Privé Pagnidibsom',
  'Cher(e) parent/tuteur de [NOM_ELEVE],

Nous vous informons que votre enfant fait l''objet d''un avertissement concernant son travail scolaire.

Nous vous invitons à l''encourager à fournir plus d''efforts.

Cordialement,
La Direction — Lycée Privé Pagnidibsom',
  'avertissement', true
),
(
  'Annonce générale',
  'Information importante — Lycée Privé Pagnidibsom',
  'Cher(e) parent/tuteur,

Nous vous informons que [CONTENU_ANNONCE].

Pour toute question : lyceepagnidibsom@gmail.com

Cordialement,
La Direction — Lycée Privé Pagnidibsom',
  'masse', true
);

create table notifications_envoyees (
  id uuid primary key default gen_random_uuid(),
  type_envoi text not null check (type_envoi in ('masse', 'cible')),
  sujet text not null,
  contenu text not null,
  modele_id uuid references modeles_messages(id) on delete set null,
  canaux jsonb not null default '["email"]',
  destinataires_count integer not null default 0,
  destinataires_emails jsonb not null default '[]',
  destinataires_telephones jsonb not null default '[]',
  destinataires_pre_inscription_ids jsonb default '[]',
  envoye_par uuid references profiles(id),
  statut text not null default 'envoye'
    check (statut in ('envoye', 'partiel', 'echec')),
  resultats jsonb default '{}',
  erreurs jsonb default '[]',
  created_at timestamptz default now()
);

alter table notifications_envoyees enable row level security;
create policy "admin_all" on notifications_envoyees for all using (is_admin());
