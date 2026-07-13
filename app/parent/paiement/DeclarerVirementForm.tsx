"use client";

import { useRef, useState, useTransition } from "react";
import { declarerVirement } from "./actions";
import FormField, { inputClasses, selectClasses } from "@/components/ui/FormField";
import { TYPES_FRAIS } from "./upload-constants";
import MobileMoneySection from "./MobileMoneySection";

export interface EleveOption {
  preInscriptionId: string;
  label: string;
}

interface DeclarerVirementFormProps {
  eleves: EleveOption[];
}

export default function DeclarerVirementForm({ eleves }: DeclarerVirementFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [montant, setMontant] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await declarerVirement(formData);
      if (res.success) {
        setSuccess(true);
        formRef.current?.reset();
        setMontant("");
      } else {
        setError(res.error);
      }
    });
  }

  if (eleves.length === 0) {
    return (
      <p className="text-sm text-neutral-500 italic">
        Aucun dossier rattaché à votre compte pour le moment.
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField id="preInscriptionId" label="Élève concerné" required>
        <select id="preInscriptionId" name="preInscriptionId" required className={selectClasses}>
          {eleves.map((el) => (
            <option key={el.preInscriptionId} value={el.preInscriptionId}>
              {el.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField id="typeFrais" label="Type de frais" required>
          <select id="typeFrais" name="typeFrais" required className={selectClasses}>
            {TYPES_FRAIS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="montant" label="Montant viré (FCFA)" required>
          <input
            id="montant"
            name="montant"
            type="number"
            min={1}
            step={1}
            required
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className={inputClasses}
            placeholder="Ex : 50000"
          />
        </FormField>
      </div>

      <MobileMoneySection montant={montant} />

      <FormField
        id="referenceVirement"
        label="Référence du virement"
        hint="Facultatif — référence indiquée sur votre avis de virement, si disponible"
      >
        <input
          id="referenceVirement"
          name="referenceVirement"
          type="text"
          className={inputClasses}
          placeholder="Ex : VIR-2026-00123"
        />
      </FormField>

      <FormField
        id="file"
        label="Justificatif du virement"
        required
        hint="Formats acceptés : photo (JPEG, PNG, WebP) ou PDF — 5 Mo maximum"
      >
        <input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          className="block w-full text-sm text-neutral-800 border border-neutral-300 rounded-lg cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-800 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-primary-900"
        />
      </FormField>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm font-semibold text-green-700">
          Votre déclaration a bien été envoyée. Notre équipe la vérifiera après consultation de
          notre relevé bancaire.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-start bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Envoi en cours..." : "Déclarer le virement"}
      </button>
    </form>
  );
}
