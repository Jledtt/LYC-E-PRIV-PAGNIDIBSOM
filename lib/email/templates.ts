const BORDEAUX = "#8B1A1A";
const SITE_URL = "https://lyceepagnidibsom.com";
const CONTACT_EMAIL = "lyceepagnidibsom@gmail.com";

export interface EmailTemplate {
  subject: string;
  html: string;
}

function wrapEmail(bodyHtml: string): string {
  return `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1a1a1a;">
  <div style="background-color: ${BORDEAUX}; padding: 20px 24px;">
    <span style="color: #ffffff; font-size: 18px; font-weight: bold;">Lycée Privé Pagnidibsom</span>
  </div>
  <div style="padding: 24px; line-height: 1.5; font-size: 14px;">
    ${bodyHtml}
  </div>
  <div style="padding: 16px 24px; border-top: 1px solid #eeeeee; color: #888888; font-size: 12px;">
    Cet email a été envoyé depuis noreply@lyceepagnidibsom.com — Ne pas répondre directement<br />
    <a href="https://lyceepagnidibsom.com" style="color: #888888;">lyceepagnidibsom.com</a> — Zanghin, Ouagadougou, Burkina Faso
  </div>
</div>`;
}

function button(href: string, label: string): string {
  return `<p style="margin: 24px 0;">
    <a href="${href}" style="background-color: ${BORDEAUX}; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 14px; display: inline-block;">${label}</a>
  </p>`;
}

export interface ConfirmationPreInscriptionParams {
  nomEleve: string;
  prenomEleve: string;
  classesouhaitee: string;
  nomParent: string;
  dossierToken: string;
}

export function confirmationPreInscription({
  nomEleve,
  prenomEleve,
  classesouhaitee,
  nomParent,
  dossierToken,
}: ConfirmationPreInscriptionParams): EmailTemplate {
  const dossierUrl = `${SITE_URL}/mon-dossier/${dossierToken}`;

  const html = wrapEmail(`
    <p>Bonjour ${nomParent},</p>
    <p>Nous vous confirmons la bonne réception de la demande de pré-inscription suivante :</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 6px 0; color: #666666;">Élève</td>
        <td style="padding: 6px 0; font-weight: bold;">${prenomEleve} ${nomEleve}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666;">Classe souhaitée</td>
        <td style="padding: 6px 0; font-weight: bold;">${classesouhaitee}</td>
      </tr>
    </table>
    <p>Votre dossier sera examiné par notre équipe dans un délai de <strong>5 à 7 jours ouvrables</strong>.</p>
    <p>Vous pouvez suivre l'avancement de votre dossier à tout moment via le lien ci-dessous :</p>
    ${button(dossierUrl, "Suivre mon dossier")}
    <p>Pour toute question, vous pouvez nous contacter à l'adresse ${CONTACT_EMAIL}.</p>
  `);

  return {
    subject: "Votre pré-inscription au Lycée Privé Pagnidibsom a bien été reçue",
    html,
  };
}

export interface NotificationAdminParams {
  nomEleve: string;
  prenomEleve: string;
  classesouhaitee: string;
  nomParent: string;
  telephone: string;
  email?: string | null;
  dossierId: string;
}

export function notificationAdmin({
  nomEleve,
  prenomEleve,
  classesouhaitee,
  nomParent,
  telephone,
  email,
  dossierId,
}: NotificationAdminParams): EmailTemplate {
  const adminUrl = `${SITE_URL}/admin/pre-inscriptions/${dossierId}`;

  const html = wrapEmail(`
    <p>Une nouvelle demande de pré-inscription vient d'être soumise.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 6px 0; color: #666666; width: 40%;">Élève</td>
        <td style="padding: 6px 0; font-weight: bold;">${prenomEleve} ${nomEleve}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666;">Classe souhaitée</td>
        <td style="padding: 6px 0; font-weight: bold;">${classesouhaitee}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666;">Contact principal</td>
        <td style="padding: 6px 0; font-weight: bold;">${nomParent}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #666666;">Téléphone</td>
        <td style="padding: 6px 0; font-weight: bold;">${telephone}</td>
      </tr>
      ${
        email
          ? `<tr>
        <td style="padding: 6px 0; color: #666666;">Email</td>
        <td style="padding: 6px 0; font-weight: bold;">${email}</td>
      </tr>`
          : ""
      }
    </table>
    ${button(adminUrl, "Voir le dossier")}
  `);

  return {
    subject: `Nouvelle pré-inscription — ${prenomEleve} ${nomEleve}, ${classesouhaitee}`,
    html,
  };
}

export type StatutChangement = "accepte" | "refuse" | "en_attente";

export interface ChangementStatutParams {
  nomEleve: string;
  prenomEleve: string;
  classesouhaitee: string;
  statut: StatutChangement;
  nomParent: string;
}

const CHANGEMENT_STATUT_SUJETS: Record<StatutChangement, string> = {
  accepte: "🎉 Pré-inscription acceptée — Lycée Privé Pagnidibsom",
  refuse: "Pré-inscription — Suite donnée à votre dossier",
  en_attente: "Pré-inscription — Dossier en cours d'examen",
};

function changementStatutCorps(
  statut: StatutChangement,
  nomParent: string,
  prenomEleve: string,
  nomEleve: string,
  classesouhaitee: string
): string {
  const eleve = `${prenomEleve} ${nomEleve}`;

  if (statut === "accepte") {
    return `
      <p>Bonjour ${nomParent},</p>
      <p>Nous avons le plaisir de vous informer que la pré-inscription de <strong>${eleve}</strong> en classe de <strong>${classesouhaitee}</strong> a été <strong>acceptée</strong>. Toutes nos félicitations !</p>
      <p><strong>Prochaines étapes :</strong></p>
      <ul style="padding-left: 20px;">
        <li>Finalisation du dossier administratif (documents à fournir)</li>
        <li>Règlement des frais de scolarité</li>
      </ul>
      <p>Notre équipe reviendra vers vous prochainement avec le détail de ces démarches. Pour toute question, contactez-nous à ${CONTACT_EMAIL}.</p>
    `;
  }

  if (statut === "refuse") {
    return `
      <p>Bonjour ${nomParent},</p>
      <p>Nous vous remercions de l'intérêt porté au Lycée Privé Pagnidibsom pour la scolarité de <strong>${eleve}</strong>.</p>
      <p>Après examen de votre dossier, nous ne sommes malheureusement pas en mesure de donner une suite favorable à cette demande de pré-inscription en classe de <strong>${classesouhaitee}</strong>.</p>
      <p>N'hésitez pas à nous recontacter à l'adresse ${CONTACT_EMAIL} si vous souhaitez échanger sur cette décision ou envisager une nouvelle demande.</p>
    `;
  }

  return `
    <p>Bonjour ${nomParent},</p>
    <p>Nous vous confirmons que le dossier de pré-inscription de <strong>${eleve}</strong> en classe de <strong>${classesouhaitee}</strong> a bien été reçu et est actuellement <strong>en cours d'examen</strong>.</p>
    <p>Nous reviendrons vers vous sous un délai de <strong>5 à 7 jours ouvrables</strong>.</p>
    <p>Pour toute question, contactez-nous à ${CONTACT_EMAIL}.</p>
  `;
}

export function changementStatut({
  nomEleve,
  prenomEleve,
  classesouhaitee,
  statut,
  nomParent,
}: ChangementStatutParams): EmailTemplate {
  return {
    subject: CHANGEMENT_STATUT_SUJETS[statut],
    html: wrapEmail(changementStatutCorps(statut, nomParent, prenomEleve, nomEleve, classesouhaitee)),
  };
}

export interface NotificationParentParams {
  sujet: string;
  contenu: string;
}

/** Convertit les retours à la ligne du contenu en paragraphes HTML. */
function contenuEnParagraphes(contenu: string): string {
  return contenu
    .split(/\n{2,}/)
    .map((bloc) => `<p style="margin: 0 0 16px;">${bloc.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function notificationParent({ sujet, contenu }: NotificationParentParams): EmailTemplate {
  const html = wrapEmail(contenuEnParagraphes(contenu));

  return {
    subject: sujet,
    html,
  };
}

export interface BienvenueEspaceParentParams {
  nomParent: string;
  prenomEleve: string;
  nomEleve: string;
  classeActuelle: string | null;
}

export function bienvenueEspaceParent({
  nomParent,
  prenomEleve,
  nomEleve,
  classeActuelle,
}: BienvenueEspaceParentParams): EmailTemplate {
  const dashboardUrl = `${SITE_URL}/parent/dashboard`;
  const classeLabel = classeActuelle ?? "classe à confirmer par l'administration";

  const html = wrapEmail(`
    <p>Bonjour ${nomParent},</p>
    <p>Le dossier de <strong>${prenomEleve} ${nomEleve}</strong> (${classeLabel}) est maintenant rattaché à votre compte sur l'Espace Parent du Lycée Privé Pagnidibsom.</p>
    <p>Vous pouvez désormais y consulter :</p>
    <ul style="padding-left: 20px;">
      <li>L'emploi du temps de votre enfant</li>
      <li>Le calendrier des devoirs et compositions</li>
      <li>Le suivi de son dossier d'inscription</li>
    </ul>
    ${button(dashboardUrl, "Accéder à l'Espace Parent")}
  `);

  return {
    subject: "Bienvenue sur l'Espace Parent — Lycée Privé Pagnidibsom",
    html,
  };
}
