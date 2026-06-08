"use client";

import { useRef, useState, useTransition } from "react";
import { submitPreInscription } from "@/actions/pre-inscription";
import type { ActionResult } from "@/actions/pre-inscription";
import FormField, { inputClasses, selectClasses } from "@/components/ui/FormField";
import { siteConfig } from "@/config/site";

type FieldErrors = Record<string, string[]>;

function getError(fieldErrors: FieldErrors | undefined, key: string): string | undefined {
  return fieldErrors?.[key]?.[0];
}

export default function PreInscriptionForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [classeSouhaitee, setClasseSouhaitee] = useState("");

  const fieldErrors = result && !result.success ? (result.fieldErrors ?? {}) : undefined;
  const showSerie = classeSouhaitee === "2nde" || classeSouhaitee === "1re";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitPreInscription(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
        setClasseSouhaitee("");
      }
    });
  }

  if (result?.success) {
    return (
      <div
        role="alert"
        className="text-center py-12 px-4 flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-primary-800 heading-serif"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
          Demande envoyée !
        </h2>
        <p className="text-neutral-600 max-w-md">
          Votre demande de pré-inscription a bien été enregistrée. Un membre de notre équipe vous
          contactera dans les 48 heures.
        </p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-2 text-primary-700 underline text-sm"
        >
          Soumettre une autre demande
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-8"
    >
      {/* Honeypot — caché aux visiteurs */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {/* Erreur globale */}
      {result && !result.success && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {result.error}
        </div>
      )}

      {/* Section Élève */}
      <fieldset className="flex flex-col gap-5">
        <legend className="text-lg font-bold text-primary-800 pb-1 border-b border-neutral-200 w-full">
          Informations sur l'élève
        </legend>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="eleveNom" label="Nom" required error={getError(fieldErrors, "eleveNom")}>
            <input
              id="eleveNom"
              name="eleveNom"
              type="text"
              autoComplete="family-name"
              required
              className={inputClasses}
              aria-invalid={!!getError(fieldErrors, "eleveNom")}
              aria-describedby={getError(fieldErrors, "eleveNom") ? "eleveNom-error" : undefined}
            />
          </FormField>

          <FormField id="elevePrenom" label="Prénom" required error={getError(fieldErrors, "elevePrenom")}>
            <input
              id="elevePrenom"
              name="elevePrenom"
              type="text"
              autoComplete="given-name"
              required
              className={inputClasses}
              aria-invalid={!!getError(fieldErrors, "elevePrenom")}
              aria-describedby={getError(fieldErrors, "elevePrenom") ? "elevePrenom-error" : undefined}
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            id="eleveDateNaissance"
            label="Date de naissance"
            required
            error={getError(fieldErrors, "eleveDateNaissance")}
          >
            <input
              id="eleveDateNaissance"
              name="eleveDateNaissance"
              type="date"
              required
              className={inputClasses}
              aria-invalid={!!getError(fieldErrors, "eleveDateNaissance")}
              aria-describedby={
                getError(fieldErrors, "eleveDateNaissance") ? "eleveDateNaissance-error" : undefined
              }
            />
          </FormField>

          <FormField id="eleveSexe" label="Sexe" required error={getError(fieldErrors, "eleveSexe")}>
            <select
              id="eleveSexe"
              name="eleveSexe"
              required
              className={selectClasses}
              aria-invalid={!!getError(fieldErrors, "eleveSexe")}
              aria-describedby={getError(fieldErrors, "eleveSexe") ? "eleveSexe-error" : undefined}
            >
              <option value="">Sélectionner...</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            id="classeSouhaitee"
            label="Classe souhaitée"
            required
            error={getError(fieldErrors, "classeSouhaitee")}
          >
            <select
              id="classeSouhaitee"
              name="classeSouhaitee"
              required
              className={selectClasses}
              value={classeSouhaitee}
              onChange={(e) => setClasseSouhaitee(e.target.value)}
              aria-invalid={!!getError(fieldErrors, "classeSouhaitee")}
              aria-describedby={
                getError(fieldErrors, "classeSouhaitee") ? "classeSouhaitee-error" : undefined
              }
            >
              <option value="">Sélectionner une classe...</option>
              <optgroup label="Enseignement Général">
                {siteConfig.classeOptions
                  .filter((cls) => cls.group === "general")
                  .map((cls) => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Enseignement Technique">
                {siteConfig.classeOptions
                  .filter((cls) => cls.group === "technique")
                  .map((cls) => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
              </optgroup>
            </select>
          </FormField>

          {/* Série conditionnelle */}
          {showSerie && (
            <FormField
              id="serie"
              label="Série"
              error={getError(fieldErrors, "serie")}
              hint="Obligatoire pour les classes de 2nde et 1re"
            >
              <select
                id="serie"
                name="serie"
                className={selectClasses}
                aria-invalid={!!getError(fieldErrors, "serie")}
                aria-describedby={getError(fieldErrors, "serie") ? "serie-error" : undefined}
              >
                <option value="">Sélectionner une série...</option>
                {siteConfig.series.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        </div>

        <FormField
          id="ecolePrecedente"
          label="École précédente"
          error={getError(fieldErrors, "ecolePrecedente")}
        >
          <input
            id="ecolePrecedente"
            name="ecolePrecedente"
            type="text"
            className={inputClasses}
            placeholder="Nom de l'établissement précédent (facultatif)"
          />
        </FormField>
      </fieldset>

      {/* Section Parent */}
      <fieldset className="flex flex-col gap-5">
        <legend className="text-lg font-bold text-primary-800 pb-1 border-b border-neutral-200 w-full">
          Informations du parent / tuteur
        </legend>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="parentNom" label="Nom" required error={getError(fieldErrors, "parentNom")}>
            <input
              id="parentNom"
              name="parentNom"
              type="text"
              required
              className={inputClasses}
              aria-invalid={!!getError(fieldErrors, "parentNom")}
              aria-describedby={getError(fieldErrors, "parentNom") ? "parentNom-error" : undefined}
            />
          </FormField>

          <FormField id="parentPrenom" label="Prénom" required error={getError(fieldErrors, "parentPrenom")}>
            <input
              id="parentPrenom"
              name="parentPrenom"
              type="text"
              required
              className={inputClasses}
              aria-invalid={!!getError(fieldErrors, "parentPrenom")}
              aria-describedby={
                getError(fieldErrors, "parentPrenom") ? "parentPrenom-error" : undefined
              }
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            id="parentTelephone"
            label="Téléphone"
            required
            error={getError(fieldErrors, "parentTelephone")}
            hint="Canal principal de contact"
          >
            <input
              id="parentTelephone"
              name="parentTelephone"
              type="tel"
              required
              autoComplete="tel"
              className={inputClasses}
              placeholder="+226 00 00 00 00"
              aria-invalid={!!getError(fieldErrors, "parentTelephone")}
              aria-describedby={
                getError(fieldErrors, "parentTelephone") ? "parentTelephone-error" : undefined
              }
            />
          </FormField>

          <FormField
            id="parentEmail"
            label="Email"
            error={getError(fieldErrors, "parentEmail")}
            hint="Facultatif"
          >
            <input
              id="parentEmail"
              name="parentEmail"
              type="email"
              autoComplete="email"
              className={inputClasses}
              placeholder="exemple@email.com (facultatif)"
              aria-invalid={!!getError(fieldErrors, "parentEmail")}
              aria-describedby={
                getError(fieldErrors, "parentEmail") ? "parentEmail-error" : undefined
              }
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            id="parentProfession"
            label="Profession"
            error={getError(fieldErrors, "parentProfession")}
          >
            <input
              id="parentProfession"
              name="parentProfession"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>

          <FormField
            id="quartierVille"
            label="Quartier / Ville"
            required
            error={getError(fieldErrors, "quartierVille")}
          >
            <input
              id="quartierVille"
              name="quartierVille"
              type="text"
              required
              className={inputClasses}
              placeholder="Ex : Secteur 12, Ouagadougou"
              aria-invalid={!!getError(fieldErrors, "quartierVille")}
              aria-describedby={
                getError(fieldErrors, "quartierVille") ? "quartierVille-error" : undefined
              }
            />
          </FormField>
        </div>
      </fieldset>

      {/* Message libre */}
      <FormField
        id="message"
        label="Message (facultatif)"
        error={getError(fieldErrors, "message")}
        hint="Questions, précisions, situation particulière..."
      >
        <textarea
          id="message"
          name="message"
          rows={4}
          className={inputClasses}
          placeholder="Écrivez ici si vous avez des informations supplémentaires à partager..."
        />
      </FormField>

      {/* Note champs obligatoires */}
      <p className="text-xs text-neutral-500">
        Les champs marqués d'un <span className="text-red-600 font-bold">*</span> sont obligatoires.
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
      >
        {isPending ? "Envoi en cours..." : "Envoyer ma demande de pré-inscription"}
      </button>
    </form>
  );
}
