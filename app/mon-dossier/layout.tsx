import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Mon dossier d'inscription",
    template: "%s | Mon dossier — Pagnidibsom",
  },
  robots: { index: false, follow: false },
};

export default function MonDossierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
