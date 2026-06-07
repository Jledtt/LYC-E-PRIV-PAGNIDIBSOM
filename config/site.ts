export const siteConfig = {
  name: "Kiswensida",
  fullName: "Collège-Lycée Kiswensida",
  tagline: "Former des esprits, bâtir des avenirs",
  description:
    "Établissement d'enseignement privé à Ouagadougou, Burkina Faso. Nous accueillons les élèves du collège (6e à 3e) et du lycée (2nde et 1re) dans un cadre sérieux et bienveillant.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiswensida.bf",
  locale: "fr_BF",

  contact: {
    address: "Secteur 12, Ouagadougou, Burkina Faso",
    phone: "+226 00 00 00 00",
    email: "contact@kiswensida.bf",
    mapLink: "",
  },

  social: {
    facebook: "https://facebook.com/kiswensida",
    whatsapp: "https://wa.me/22600000000",
  },

  cycles: [
    { label: "6e", category: "college" },
    { label: "5e", category: "college" },
    { label: "4e", category: "college" },
    { label: "3e", category: "college" },
    { label: "2nde", category: "lycee" },
    { label: "1re", category: "lycee" },
  ],

  series: [
    { value: "A", label: "Littéraire (A)" },
    { value: "C", label: "Scientifique (C)" },
    { value: "D", label: "Scientifique (D)" },
  ],

  classeOptions: [
    { value: "6e", label: "6e", requireSerie: false },
    { value: "5e", label: "5e", requireSerie: false },
    { value: "4e", label: "4e", requireSerie: false },
    { value: "3e", label: "3e", requireSerie: false },
    { value: "2nde", label: "2nde", requireSerie: true },
    { value: "1re", label: "1re", requireSerie: true },
  ],
} as const;
