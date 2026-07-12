export const siteConfig = {
  name: "Pagnidibsom",
  fullName: "Lycée Privé Pagnidibsom",
  sigle: "LPP",
  tagline: "Bâtir l'Excellence",
  founder: "Tiendrebeogo Ousmane",
  proviseur: "Sœur Marie Madeleine Dakono",
  foundedYear: 2021,
  description:
    "Le Lycée Privé Pagnidibsom (LPP) est un établissement d'enseignement privé situé au Secteur 32 de Ouagadougou, Burkina Faso. Nous accueillons les élèves du primaire (CP1 à CM2), du collège (6e à 3e), du lycée général (2nde et 1re — séries A et D) et de l'enseignement technique (BEP1 Génie Civil, BEP1 Électrotechnique) dans un cadre clôturé, sécurisé et propice à l'excellence.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://lyceepagnidibsom.com",
  locale: "fr_BF",

  contact: {
    address: "Quartier Sondogo, Secteur 32, Ouagadougou, Burkina Faso",
    addressDetail: "à 800 m du Centre Spirituel Paam Yondo, 300 m de la voie bitumée",
    bp: "04 BP 8825 Ouaga 04",
    phone: "+226 72 81 61 59",
    phoneAlt: "+226 78 42 62 06",
    email: "infoslyceepagnidibsom@gmail.com",
    mapLink: "",
  },

  social: {
    facebook: "https://facebook.com/kiswensida",
    whatsapp: "https://wa.me/22600000000",
  },

  cycles: [
    { label: "6e",  category: "college" },
    { label: "5e",  category: "college" },
    { label: "4e",  category: "college" },
    { label: "3e",  category: "college" },
    { label: "2nde", category: "lycee" },
    { label: "1re",  category: "lycee" },
    { label: "BEP1 GC", category: "technique" },
    { label: "BEP1 ÉT", category: "technique" },
  ],

  series: [
    { value: "A", label: "Littéraire (A)" },
    { value: "D", label: "Scientifique (D)" },
  ],

  classeOptions: [
    /* Enseignement primaire */
    { value: "CP1", label: "CP1", requireSerie: false, group: "primaire" },
    { value: "CP2", label: "CP2", requireSerie: false, group: "primaire" },
    { value: "CE1", label: "CE1", requireSerie: false, group: "primaire" },
    { value: "CE2", label: "CE2", requireSerie: false, group: "primaire" },
    { value: "CM1", label: "CM1", requireSerie: false, group: "primaire" },
    { value: "CM2", label: "CM2", requireSerie: false, group: "primaire" },
    /* Enseignement général */
    { value: "6e",   label: "6e",   requireSerie: false, group: "general" },
    { value: "5e",   label: "5e",   requireSerie: false, group: "general" },
    { value: "4e",   label: "4e",   requireSerie: false, group: "general" },
    { value: "3e",   label: "3e",   requireSerie: false, group: "general" },
    { value: "2nde", label: "2nde", requireSerie: true,  group: "general" },
    { value: "1re",  label: "1re",  requireSerie: true,  group: "general" },
    /* Enseignement technique */
    { value: "BEP1-GC", label: "BEP1 Génie Civil",       requireSerie: false, group: "technique" },
    { value: "BEP1-ET", label: "BEP1 Électrotechnique",  requireSerie: false, group: "technique" },
  ],
} as const;
