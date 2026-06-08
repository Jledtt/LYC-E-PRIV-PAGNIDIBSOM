import { z } from "zod";

const phoneRegex = /^(\+?226)?[0-9\s\-]{8,15}$/;

/** Transforme une chaîne vide en undefined (utile pour les champs optionnels) */
function emptyToUndefined(v: unknown) {
  return v === "" ? undefined : v;
}

export const preInscriptionSchema = z.object({
  /* Honeypot — doit être vide */
  website: z.string().max(0).optional(),

  /* Élève */
  eleveNom:    z.string().min(2, "Le nom est requis (minimum 2 caractères)").max(100),
  elevePrenom: z.string().min(2, "Le prénom est requis (minimum 2 caractères)").max(100),
  eleveDateNaissance: z
    .string()
    .min(1, "La date de naissance est requise")
    .refine((v) => !isNaN(Date.parse(v)), { message: "Date invalide" }),
  eleveSexe: z.enum(["M", "F"] as const).refine(Boolean, "Le sexe est requis"),
  classeSouhaitee: z
    .enum(["6e", "5e", "4e", "3e", "2nde", "1re", "BEP1-GC", "BEP1-ET"] as const)
    .refine(Boolean, "La classe souhaitée est requise"),
  serie: z.preprocess(
    emptyToUndefined,
    z.enum(["A", "C"] as const).optional()
  ),
  ecolePrecedente: z.preprocess(emptyToUndefined, z.string().max(200).optional()),

  /* Parent / tuteur */
  parentNom:       z.string().min(2, "Le nom est requis").max(100),
  parentPrenom:    z.string().min(2, "Le prénom est requis").max(100),
  parentTelephone: z
    .string()
    .min(1, "Le téléphone est requis")
    .regex(phoneRegex, "Numéro de téléphone invalide"),
  parentEmail: z.preprocess(
    emptyToUndefined,
    z.string().email("Email invalide").max(200).optional()
  ),
  parentProfession: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
  quartierVille:    z.string().min(2, "Le quartier/ville est requis").max(150),

  /* Message libre */
  message: z.preprocess(emptyToUndefined, z.string().max(1000).optional()),
});

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
