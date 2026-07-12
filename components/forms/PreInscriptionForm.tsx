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
  const [eleveInfo, setEleveInfo] = useState<{ nom: string; prenom: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fieldErrors = result && !result.success ? (result.fieldErrors ?? {}) : undefined;
  const showSerie = classeSouhaitee === "2nde" || classeSouhaitee === "1re";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eleveNom = String(formData.get("eleveNom") ?? "");
    const elevePrenom = String(formData.get("elevePrenom") ?? "");
    startTransition(async () => {
      const res = await submitPreInscription(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
        setClasseSouhaitee("");
        setEleveInfo({ nom: eleveNom, prenom: elevePrenom });
        setCopied(false);
      }
    });
  }

  async function handleCopyDossierUrl(url: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("[pre-inscription] Copie du lien échouée :", err);
    }
  }

  if (result?.success) {
    const dossierUrl = result.dossierUrl;
    const nomComplet = eleveInfo ? `${eleveInfo.prenom} ${eleveInfo.nom}`.trim() : "";
    const whatsappMessage = dossierUrl
      ? `Bonjour, voici le lien pour compléter et suivre le dossier d'inscription de ${nomComplet || "l'élève"} au Lycée Privé Pagnidibsom : ${dossierUrl}`
      : "";
    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

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

        {dossierUrl && (
          <div className="w-full max-w-md flex flex-col gap-4 mt-2 p-5 rounded-lg border border-accent-200 bg-[#FFFDF8] text-left">
            <p className="text-sm text-[#1F2937]">
              Ce lien personnel vous permet de <strong>compléter votre dossier</strong> (déposer
              les pièces demandées) et de <strong>suivre son état d&apos;avancement</strong>.
              Conservez-le précieusement.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={dossierUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 text-xs sm:text-sm rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-[#1F2937] font-mono"
                aria-label="Lien de votre dossier d'inscription"
              />
              <button
                type="button"
                onClick={() => handleCopyDossierUrl(dossierUrl)}
                className="shrink-0 rounded-lg border border-primary-800 text-primary-800 px-4 py-2.5 text-sm font-semibold hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                {copied ? "Lien copié !" : "Copier le lien"}
              </button>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2.5 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              Recevoir ce lien sur WhatsApp
            </a>

            <p className="text-xs text-primary-800 font-medium">
              ⚠ Ce lien est personnel et confidentiel : ne le partagez pas publiquement.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setResult(null);
            setEleveInfo(null);
            setCopied(false);
          }}
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
      {/* Honeypot — hors écran, jamais display:none (trop détectable) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
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
              <optgroup label="Enseignement Primaire">
                {siteConfig.classeOptions
                  .filter((cls) => cls.group === "primaire")
                  .map((cls) => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
              </optgroup>
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

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            id="eleveLieuNaissance"
            label="Lieu de naissance"
            error={getError(fieldErrors, "eleveLieuNaissance")}
          >
            <input
              id="eleveLieuNaissance"
              name="eleveLieuNaissance"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>

          <FormField
            id="eleveNationalite"
            label="Nationalité"
            error={getError(fieldErrors, "eleveNationalite")}
          >
            <input
              id="eleveNationalite"
              name="eleveNationalite"
              type="text"
              defaultValue="Burkinabè"
              className={inputClasses}
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="eleveEthnie" label="Ethnie" error={getError(fieldErrors, "eleveEthnie")}>
            <input
              id="eleveEthnie"
              name="eleveEthnie"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>

          <FormField id="eleveReligion" label="Religion" error={getError(fieldErrors, "eleveReligion")}>
            <input
              id="eleveReligion"
              name="eleveReligion"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            id="classeRedoublee"
            label="Classe déjà redoublée ?"
            error={getError(fieldErrors, "classeRedoublee")}
            hint="L'élève a-t-il déjà redoublé la classe demandée ?"
          >
            <select id="classeRedoublee" name="classeRedoublee" className={selectClasses} defaultValue="non">
              <option value="non">Non</option>
              <option value="oui">Oui</option>
            </select>
          </FormField>

          <FormField id="secteur" label="Secteur" error={getError(fieldErrors, "secteur")}>
            <input
              id="secteur"
              name="secteur"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
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

          <FormField
            id="eleveTelephoneDomicile"
            label="Téléphone domicile"
            error={getError(fieldErrors, "eleveTelephoneDomicile")}
          >
            <input
              id="eleveTelephoneDomicile"
              name="eleveTelephoneDomicile"
              type="tel"
              className={inputClasses}
              placeholder="+226 00 00 00 00 (facultatif)"
              aria-invalid={!!getError(fieldErrors, "eleveTelephoneDomicile")}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Section Père */}
      <fieldset className="flex flex-col gap-5">
        <legend className="text-lg font-bold text-primary-800 pb-1 border-b border-neutral-200 w-full">
          Informations du père
        </legend>
        <p className="text-xs text-neutral-500 -mt-2">
          Renseignez au moins les informations du père ou de la mère/tutrice ci-dessous.
        </p>
        {getError(fieldErrors, "pereNom") && (
          <p role="alert" className="text-xs text-red-600">
            {getError(fieldErrors, "pereNom")}
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="pereNom" label="Nom" error={getError(fieldErrors, "pereNom")}>
            <input id="pereNom" name="pereNom" type="text" className={inputClasses} placeholder="Facultatif" />
          </FormField>

          <FormField id="perePrenom" label="Prénom" error={getError(fieldErrors, "perePrenom")}>
            <input
              id="perePrenom"
              name="perePrenom"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="pereProfession" label="Profession" error={getError(fieldErrors, "pereProfession")}>
            <input
              id="pereProfession"
              name="pereProfession"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>

          <FormField id="pereService" label="Service / Employeur" error={getError(fieldErrors, "pereService")}>
            <input
              id="pereService"
              name="pereService"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="pereTelephone" label="Téléphone" error={getError(fieldErrors, "pereTelephone")}>
            <input
              id="pereTelephone"
              name="pereTelephone"
              type="tel"
              className={inputClasses}
              placeholder="+226 00 00 00 00 (facultatif)"
              aria-invalid={!!getError(fieldErrors, "pereTelephone")}
            />
          </FormField>

          <FormField id="pereEmail" label="E-mail" error={getError(fieldErrors, "pereEmail")}>
            <input
              id="pereEmail"
              name="pereEmail"
              type="email"
              className={inputClasses}
              placeholder="exemple@email.com (facultatif)"
              aria-invalid={!!getError(fieldErrors, "pereEmail")}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Section Mère / tutrice */}
      <fieldset className="flex flex-col gap-5">
        <legend className="text-lg font-bold text-primary-800 pb-1 border-b border-neutral-200 w-full">
          Informations de la mère / tutrice
        </legend>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="mereNom" label="Nom" error={getError(fieldErrors, "mereNom")}>
            <input id="mereNom" name="mereNom" type="text" className={inputClasses} placeholder="Facultatif" />
          </FormField>

          <FormField id="merePrenom" label="Prénom" error={getError(fieldErrors, "merePrenom")}>
            <input
              id="merePrenom"
              name="merePrenom"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="mereProfession" label="Profession" error={getError(fieldErrors, "mereProfession")}>
            <input
              id="mereProfession"
              name="mereProfession"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>

          <FormField id="mereService" label="Service / Employeur" error={getError(fieldErrors, "mereService")}>
            <input
              id="mereService"
              name="mereService"
              type="text"
              className={inputClasses}
              placeholder="Facultatif"
            />
          </FormField>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField id="mereTelephone" label="Téléphone" error={getError(fieldErrors, "mereTelephone")}>
            <input
              id="mereTelephone"
              name="mereTelephone"
              type="tel"
              className={inputClasses}
              placeholder="+226 00 00 00 00 (facultatif)"
              aria-invalid={!!getError(fieldErrors, "mereTelephone")}
            />
          </FormField>

          <FormField id="mereEmail" label="E-mail" error={getError(fieldErrors, "mereEmail")}>
            <input
              id="mereEmail"
              name="mereEmail"
              type="email"
              className={inputClasses}
              placeholder="exemple@email.com (facultatif)"
              aria-invalid={!!getError(fieldErrors, "mereEmail")}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Section Contact principal */}
      <fieldset className="flex flex-col gap-5">
        <legend className="text-lg font-bold text-primary-800 pb-1 border-b border-neutral-200 w-full">
          Contact principal (suivi du dossier)
        </legend>

        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            id="parentTelephone"
            label="Téléphone"
            required
            error={getError(fieldErrors, "parentTelephone")}
            hint="Canal principal de contact (WhatsApp)"
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
      </fieldset>

      {/* Section Observations particulières */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-lg font-bold text-primary-800 pb-1 border-b border-neutral-200 w-full">
          Observations particulières
        </legend>
        <p className="text-sm text-neutral-600 -mt-2">
          État de santé — Pathologies connues (cochez si applicable)
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              name="santeAsthme"
              className="w-4 h-4 rounded border-neutral-300 text-primary-800 focus:ring-primary-600"
            />
            Asthme
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              name="santeCardiopathie"
              className="w-4 h-4 rounded border-neutral-300 text-primary-800 focus:ring-primary-600"
            />
            Cardiopathie
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              name="santeDiabete"
              className="w-4 h-4 rounded border-neutral-300 text-primary-800 focus:ring-primary-600"
            />
            Diabète
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              name="santeDrepanocytose"
              className="w-4 h-4 rounded border-neutral-300 text-primary-800 focus:ring-primary-600"
            />
            Drépanocytose
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              name="santeHta"
              className="w-4 h-4 rounded border-neutral-300 text-primary-800 focus:ring-primary-600"
            />
            HTA
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              name="santeEpilepsie"
              className="w-4 h-4 rounded border-neutral-300 text-primary-800 focus:ring-primary-600"
            />
            Épilepsie
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-800">Aptitude au sport</span>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="aptitudeSport"
                value="apte"
                className="w-4 h-4 border-neutral-300 text-primary-800 focus:ring-primary-600"
              />
              Apte
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="aptitudeSport"
                value="inapte"
                className="w-4 h-4 border-neutral-300 text-primary-800 focus:ring-primary-600"
              />
              Inapte
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="aptitudeSport"
                value=""
                defaultChecked
                className="w-4 h-4 border-neutral-300 text-primary-800 focus:ring-primary-600"
              />
              Non renseigné
            </label>
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          Ces informations sont confidentielles et ne seront utilisées qu&rsquo;à des fins
          médicales d&rsquo;urgence.
        </p>
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
