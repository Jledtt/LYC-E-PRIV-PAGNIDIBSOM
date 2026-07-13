export const COORDONNEES_BANCAIRES = {
  banque: 'Ecobank Burkina Faso',
  adresseBanque: '49, rue de l\'hôtel de ville, 01 BP 145 Ouagadougou 01',
  titulaire: 'LYCEE PRIVE PAGNIDIBSOM',
  codePays: 'BF51',
  codeBanque: 'BF083',
  codeGuichet: '00010',
  numeroCompte: '171877780001',
  cleRib: '38',
  iban: 'BF51BF083000101718777800138',
  swift: 'ECOCBFBF',
  devise: 'XOF',
  typeCompte: 'Courant',
} as const

export const MOBILE_MONEY = {
  orange: {
    actif: false, // passer à true une fois le numéro renseigné
    numero: '',
    nomCompte: '',
  },
  moov: {
    actif: false, // passer à true une fois le numéro renseigné
    numero: '',
    nomCompte: '',
  },
} as const
