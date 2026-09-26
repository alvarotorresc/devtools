import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'uuid',
  category: 'gen',
  icon: 'fingerprint',
  slug: { es: 'generador-uuid', en: 'uuid-generator' },
  name: { es: 'UUID, ULID y NanoID', en: 'UUID, ULID & NanoID' },
  title: {
    es: 'Generador de UUID v4 y v7, ULID y NanoID',
    en: 'UUID v4 and v7, ULID and NanoID generator',
  },
  description: {
    es: 'Genera hasta 500 UUID v4 o v7, ULID o NanoID de golpe y comprueba cualquier identificador: versión, validez y fecha que lleva dentro.',
    en: 'Generate up to 500 UUID v4 or v7, ULID or NanoID at once and check any identifier: version, validity and the date it carries.',
  },
  keywords: {
    es: ['uuid', 'guid', 'uuid v7', 'ulid', 'nanoid', 'identificador unico', 'validar uuid'],
    en: ['uuid', 'guid', 'uuid v7', 'ulid', 'nanoid', 'unique id', 'validate uuid'],
  },
  tabs: { es: ['Generar', 'Validar'], en: ['Generate', 'Validate'] },
};
