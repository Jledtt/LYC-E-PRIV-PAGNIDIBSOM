import { z } from "zod";

const phoneRegex = /^(\+?226)?[0-9\s\-]{8,15}$/;

export const preInscriptionSchema = z.object({
  /* Honeypot — doit être vide */
  website: z.string().max(0, "Champ non autorisé").optional(),

  /* Élève */
  eleveNom: z.string().min(2, "Le nom est requis (minimum 2 caractères)").max(100),
  elevePrenom: z.string().min(2, "Le prénom est requis (minimum 2 caractères)").max(100),
  eleveDateNaissance: z
    .string()
    .min(1, "La date de naissance est requise")
    .refine((v) => !isNaN(Date.parse(v)), "Date invalide"),
  eleveSexe: z.enum(["M", "F"], { required_error: "Le sexe est requis" }),
  classeSouhaitee: z.enum(["6e", "5e", "4e", "3e", "2nde", "1re"], {
    required_error: "La classe souhaitée est requise",
  }),
  serie: z
    .enum(["A", "C", "D", ""])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  ecolePrecedente: z.string().max(200).optional(),

  /* Parent / tuteur */
  parentNom: z.string().min(2, "Le nom est requis").max(100),
  parentPrenom: z.string().min(2, "Le prénom est requis").max(100),
  parentTelephone: z
    .string()
    .min(1, "Le téléphone est requis")
    .regex(phoneRegex, "Numéro de téléphone invalide"),
  parentEmail: z.string().email("Email invalide").max(200).optional().or(z.literal("")),
  parentProfession: z.string().max(100).optional(),
  quartierVille: z.string().min(2, "Le quartier/ville est requis").max(150),

  /* Message libre */
  message: z.string().max(1000).optional(),
});

export type PreInscriptionInput = z.infer<typeof preInscriptionSchema>;

export const contactSchema = z
  .object({
    /* Honeypot */
    website: z.string().max(0, "Champ non autorisé").optional(),

    nom: z.string().min(2, "Le nom est requis").max(100),
    telephone: z
      .string()
      .regex(phoneRegex, "Numéro de téléphone invalide")
      .optional()
      .or(z.literal("")),
    email: z.string().email("Email invalide").max(200).optional().or(z.literal("")),
    message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(2000),
  })
  .refine((data) => (data.telephone && data.telephone.length > 0) || (data.email && data.email.length > 0), {
    message: "Veuillez renseigner au moins un téléphone ou un email",
    path: ["telephone"],
  });

export type ContactInput = z.infer<typeof contactSchema>;
