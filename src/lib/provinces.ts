export interface Province {
  /** '01'…'52': the same code in postal codes, INE and Social Security. */
  code: string;
  /** Official name. */
  name: string;
  /** Capital city (mock data uses it as the city of the row). */
  capital: string;
  /** Autonomous community or city. */
  community: string;
  /** Provincial licence plate prefixes (1971–2000). */
  plates: string[];
}

// Written by hand: INE province codes, which postal codes and Social Security numbers reuse.
export const PROVINCES: readonly Province[] = [
  {
    code: '01',
    name: 'Araba/Álava',
    capital: 'Vitoria-Gasteiz',
    community: 'País Vasco',
    plates: ['VI'],
  },
  {
    code: '02',
    name: 'Albacete',
    capital: 'Albacete',
    community: 'Castilla-La Mancha',
    plates: ['AB'],
  },
  {
    code: '03',
    name: 'Alicante/Alacant',
    capital: 'Alicante',
    community: 'Comunitat Valenciana',
    plates: ['A'],
  },
  { code: '04', name: 'Almería', capital: 'Almería', community: 'Andalucía', plates: ['AL'] },
  { code: '05', name: 'Ávila', capital: 'Ávila', community: 'Castilla y León', plates: ['AV'] },
  { code: '06', name: 'Badajoz', capital: 'Badajoz', community: 'Extremadura', plates: ['BA'] },
  {
    code: '07',
    name: 'Illes Balears',
    capital: 'Palma',
    community: 'Illes Balears',
    plates: ['PM', 'IB'],
  },
  { code: '08', name: 'Barcelona', capital: 'Barcelona', community: 'Cataluña', plates: ['B'] },
  { code: '09', name: 'Burgos', capital: 'Burgos', community: 'Castilla y León', plates: ['BU'] },
  { code: '10', name: 'Cáceres', capital: 'Cáceres', community: 'Extremadura', plates: ['CC'] },
  { code: '11', name: 'Cádiz', capital: 'Cádiz', community: 'Andalucía', plates: ['CA'] },
  {
    code: '12',
    name: 'Castellón/Castelló',
    capital: 'Castellón de la Plana',
    community: 'Comunitat Valenciana',
    plates: ['CS'],
  },
  {
    code: '13',
    name: 'Ciudad Real',
    capital: 'Ciudad Real',
    community: 'Castilla-La Mancha',
    plates: ['CR'],
  },
  { code: '14', name: 'Córdoba', capital: 'Córdoba', community: 'Andalucía', plates: ['CO'] },
  { code: '15', name: 'A Coruña', capital: 'A Coruña', community: 'Galicia', plates: ['C'] },
  {
    code: '16',
    name: 'Cuenca',
    capital: 'Cuenca',
    community: 'Castilla-La Mancha',
    plates: ['CU'],
  },
  { code: '17', name: 'Girona', capital: 'Girona', community: 'Cataluña', plates: ['GE', 'GI'] },
  { code: '18', name: 'Granada', capital: 'Granada', community: 'Andalucía', plates: ['GR'] },
  {
    code: '19',
    name: 'Guadalajara',
    capital: 'Guadalajara',
    community: 'Castilla-La Mancha',
    plates: ['GU'],
  },
  {
    code: '20',
    name: 'Gipuzkoa',
    capital: 'Donostia-San Sebastián',
    community: 'País Vasco',
    plates: ['SS'],
  },
  { code: '21', name: 'Huelva', capital: 'Huelva', community: 'Andalucía', plates: ['H'] },
  { code: '22', name: 'Huesca', capital: 'Huesca', community: 'Aragón', plates: ['HU'] },
  { code: '23', name: 'Jaén', capital: 'Jaén', community: 'Andalucía', plates: ['J'] },
  { code: '24', name: 'León', capital: 'León', community: 'Castilla y León', plates: ['LE'] },
  { code: '25', name: 'Lleida', capital: 'Lleida', community: 'Cataluña', plates: ['L'] },
  { code: '26', name: 'La Rioja', capital: 'Logroño', community: 'La Rioja', plates: ['LO'] },
  { code: '27', name: 'Lugo', capital: 'Lugo', community: 'Galicia', plates: ['LU'] },
  {
    code: '28',
    name: 'Madrid',
    capital: 'Madrid',
    community: 'Comunidad de Madrid',
    plates: ['M'],
  },
  { code: '29', name: 'Málaga', capital: 'Málaga', community: 'Andalucía', plates: ['MA'] },
  { code: '30', name: 'Murcia', capital: 'Murcia', community: 'Región de Murcia', plates: ['MU'] },
  {
    code: '31',
    name: 'Navarra',
    capital: 'Pamplona',
    community: 'Comunidad Foral de Navarra',
    plates: ['NA'],
  },
  { code: '32', name: 'Ourense', capital: 'Ourense', community: 'Galicia', plates: ['OR', 'OU'] },
  {
    code: '33',
    name: 'Asturias',
    capital: 'Oviedo',
    community: 'Principado de Asturias',
    plates: ['O'],
  },
  {
    code: '34',
    name: 'Palencia',
    capital: 'Palencia',
    community: 'Castilla y León',
    plates: ['P'],
  },
  {
    code: '35',
    name: 'Las Palmas',
    capital: 'Las Palmas de Gran Canaria',
    community: 'Canarias',
    plates: ['GC'],
  },
  { code: '36', name: 'Pontevedra', capital: 'Pontevedra', community: 'Galicia', plates: ['PO'] },
  {
    code: '37',
    name: 'Salamanca',
    capital: 'Salamanca',
    community: 'Castilla y León',
    plates: ['SA'],
  },
  {
    code: '38',
    name: 'Santa Cruz de Tenerife',
    capital: 'Santa Cruz de Tenerife',
    community: 'Canarias',
    plates: ['TF'],
  },
  { code: '39', name: 'Cantabria', capital: 'Santander', community: 'Cantabria', plates: ['S'] },
  { code: '40', name: 'Segovia', capital: 'Segovia', community: 'Castilla y León', plates: ['SG'] },
  { code: '41', name: 'Sevilla', capital: 'Sevilla', community: 'Andalucía', plates: ['SE'] },
  { code: '42', name: 'Soria', capital: 'Soria', community: 'Castilla y León', plates: ['SO'] },
  { code: '43', name: 'Tarragona', capital: 'Tarragona', community: 'Cataluña', plates: ['T'] },
  { code: '44', name: 'Teruel', capital: 'Teruel', community: 'Aragón', plates: ['TE'] },
  {
    code: '45',
    name: 'Toledo',
    capital: 'Toledo',
    community: 'Castilla-La Mancha',
    plates: ['TO'],
  },
  {
    code: '46',
    name: 'Valencia/València',
    capital: 'Valencia',
    community: 'Comunitat Valenciana',
    plates: ['V'],
  },
  {
    code: '47',
    name: 'Valladolid',
    capital: 'Valladolid',
    community: 'Castilla y León',
    plates: ['VA'],
  },
  { code: '48', name: 'Bizkaia', capital: 'Bilbao', community: 'País Vasco', plates: ['BI'] },
  { code: '49', name: 'Zamora', capital: 'Zamora', community: 'Castilla y León', plates: ['ZA'] },
  { code: '50', name: 'Zaragoza', capital: 'Zaragoza', community: 'Aragón', plates: ['Z'] },
  {
    code: '51',
    name: 'Ceuta',
    capital: 'Ceuta',
    community: 'Ciudad Autónoma de Ceuta',
    plates: ['CE'],
  },
  {
    code: '52',
    name: 'Melilla',
    capital: 'Melilla',
    community: 'Ciudad Autónoma de Melilla',
    plates: ['ML'],
  },
];

export function provinceByCode(code: string): Province | undefined {
  return PROVINCES.find((p) => p.code === code);
}

/** Case-insensitive: 'gi' and 'GI' both find Girona. */
export function provinceByPlate(prefix: string): Province | undefined {
  const p = prefix.toUpperCase();
  return PROVINCES.find((x) => x.plates.includes(p));
}
