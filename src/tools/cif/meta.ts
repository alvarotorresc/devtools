import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cif',
  category: 'ids',
  icon: 'building',
  slug: { es: 'validador-cif', en: 'spanish-cif-validator' },
  name: { es: 'CIF', en: 'CIF (Spanish company tax ID)' },
  title: {
    es: 'Validar CIF online: NIF de empresa y generador',
    en: 'CIF validator: Spanish company tax ID',
  },
  heading: {
    es: 'Validador de CIF',
    en: 'CIF validator',
  },
  description: {
    es: 'Valida el CIF o NIF de una empresa, te dice el tipo de entidad y el carácter de control correcto, y genera CIF ficticios para pruebas.',
    en: 'Validate the CIF of a Spanish company, see its entity type and the right check character, and generate fictitious CIF numbers for testing.',
  },
  keywords: {
    es: [
      'validar cif',
      'cif empresa',
      'nif empresa',
      'comprobar cif',
      'generador cif',
      'digito control cif',
    ],
    en: ['cif validator', 'spanish cif', 'spanish company tax id', 'nif empresa', 'cif generator'],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: true,
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre CIF y NIF?',
        a: 'Desde 2008 el nombre oficial es NIF para todos, personas y empresas. «CIF» sigue usándose para el NIF de las entidades, que empieza por una letra que indica la forma jurídica.',
      },
      {
        q: '¿Un CIF válido significa que la empresa existe?',
        a: 'No. Solo significa que el carácter de control cuadra con las cifras. Para saber si una empresa está dada de alta hay que consultar el censo de la Agencia Tributaria.',
      },
    ],
    en: [
      {
        q: 'What is the difference between CIF and NIF?',
        a: 'Since 2008 the official name is NIF for everyone, people and companies. “CIF” is still used for the tax ID of entities, which starts with a letter that tells the legal form.',
      },
      {
        q: 'Does a valid CIF mean the company exists?',
        a: 'No. It only means the check character matches the digits. To know whether a company is registered you have to look it up in the Spanish Tax Agency census.',
      },
    ],
  },
};
