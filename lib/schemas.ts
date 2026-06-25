import { z } from "zod";

const phoneRegex = /^(\+?226)?[0-9\s\-]{8,15}$/;

/** Transforme une chaîne vide en undefined (utile pour les champs optionnels) */
function emptyToUndefined(v: unknown) {
  return v === "" ? undefined : v;
}

/** "oui"/"non" (radio/select) -> boolean, valeur absente -> false */
function ouiNonToBoolean(v: unknown) {
  if (v === "oui") return true;
  if (v === "non" || v === "" || v == null) return false;
  return v;
}

export const preInscriptionSchema = z
  .object({
    /* Honeypot — doit être vide */
    website: z.string().max(0).optional(),

    /* Élève */
    eleveNom:    z.string().min(2, "Le nom est requis (minimum 2 caractères)").max(100),
    elevePrenom: z.string().min(2, "Le prénom est requis (minimum 2 caractères)").max(100),
    eleveDateNaissance: z
      .string()
      .min(1, "La date de naissance est requise")
      .refine((v) => !isNaN(Date.parse(v)), { message: "Date invalide" }),
    eleveLieuNaissance: z.preprocess(emptyToUndefined, z.string().max(150).optional()),
    eleveNationalite: z.preprocess(
      emptyToUndefined,
      z.string().max(100).default("Burkinabè")
    ),
    eleveSexe: z.enum(["M", "F"] as const).refine(Boolean, "Le sexe est requis"),
    classeSouhaitee: z
      .enum(["6e", "5e", "4e", "3e", "2nde", "1re", "BEP1-GC", "BEP1-ET"] as const)
      .refine(Boolean, "La classe souhaitée est requise"),
    serie: z.preprocess(
      emptyToUndefined,
      z.enum(["A", "C"] as const).optional()
    ),
    classeRedoublee: z.preprocess(ouiNonToBoolean, z.boolean().default(false)),
    ecolePrecedente: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
    secteur: z.preprocess(emptyToUndefined, z.string().max(50).optional()),

    /* Père */
    pereNom:        z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    perePrenom:     z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    pereProfession: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    pereTelephone: z.preprocess(
      emptyToUndefined,
      z.string().regex(phoneRegex, "Numéro de téléphone invalide").optional()
    ),

    /* Mère / tutrice */
    mereNom:        z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    merePrenom:     z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    mereProfession: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
    mereTelephone: z.preprocess(
      emptyToUndefined,
      z.string().regex(phoneRegex, "Numéro de téléphone invalide").optional()
    ),

    /* Contact principal (WhatsApp / suivi du dossier) */
    parentTelephone: z
      .string()
      .min(1, "Le téléphone est requis")
      .regex(phoneRegex, "Numéro de téléphone invalide"),
    parentEmail: z.preprocess(
      emptyToUndefined,
      z.string().email("Email invalide").max(200).optional()
    ),
    quartierVille: z.string().min(2, "Le quartier/ville est requis").max(150),

    /* Message libre */
    message: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
  })
  .refine(
    (data) => {
      const hasPere = Boolean(data.pereNom && data.perePrenom);
      const hasMere = Boolean(data.mereNom && data.merePrenom);
      return hasPere || hasMere;
    },
    {
      message: "Veuillez renseigner au moins les nom et prénom du père ou de la mère/tutrice.",
      path: ["pereNom"],
    }
  );

export type PreInscriptionInput = z.infer<typeof preInscriptionSchema>;

export const contactSchema = z
  .object({
    /* Honeypot */
    website: z.string().max(0).optional(),

    nom: z.string().min(2, "Le nom est requis").max(100),
    telephone: z.preprocess(
      emptyToUndefined,
      z.string().regex(phoneRegex, "Numéro de téléphone invalide").optional()
    ),
    email: z.preprocess(
      emptyToUndefined,
      z.string().email("Email invalide").max(200).optional()
    ),
    message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(2000),
  })
  .refine(
    (data) => {
      const hasTel   = typeof data.telephone === "string" && data.telephone.length > 0;
      const hasEmail = typeof data.email     === "string" && data.email.length     > 0;
      return hasTel || hasEmail;
    },
    {
      message: "Veuillez renseigner au moins un téléphone ou un email",
      path: ["telephone"],
    }
  );

export type ContactInput = z.infer<typeof contactSchema>;
