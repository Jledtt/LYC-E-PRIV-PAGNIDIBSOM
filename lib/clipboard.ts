/**
 * Copie un texte dans le presse-papier. Utilise la Clipboard API si
 * disponible (contexte sécurisé), avec repli sur execCommand("copy") sinon
 * (cf. components/forms/PreInscriptionForm.tsx).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    return true;
  } catch (err) {
    console.error("[clipboard] Copie échouée :", err);
    return false;
  }
}
