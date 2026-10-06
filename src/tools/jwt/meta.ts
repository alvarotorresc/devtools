import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'jwt',
  category: 'enc',
  icon: 'key-round',
  slug: { es: 'decodificador-jwt', en: 'jwt-decoder' },
  name: { es: 'JWT', en: 'JWT' },
  title: {
    es: 'Decodificar JWT online: cabecera y payload',
    en: 'JWT decoder online: header, payload and expiry',
  },
  heading: {
    es: 'Decodificador de JWT',
    en: 'JWT decoder',
  },
  description: {
    es: 'Pega un JWT y ve su cabecera, su payload y si está vigente, caducado o aún no es válido, con las fechas en tu hora local. No sale de tu navegador.',
    en: 'Paste a JWT to see its header, its payload and whether it is valid, expired or not yet valid, with dates in your local time. It never leaves your browser.',
  },
  keywords: {
    es: ['jwt', 'decodificar jwt', 'json web token', 'token jwt', 'exp jwt', 'bearer token'],
    en: ['jwt', 'jwt decoder', 'decode jwt', 'json web token', 'jwt expiration', 'bearer token'],
  },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Se guarda el token?',
        a: 'No. Esta herramienta nunca guarda lo que pegas, ni siquiera en tu navegador, porque un JWT suele dar acceso a una cuenta.',
      },
      {
        q: '¿Comprueba la firma?',
        a: 'No. Para verificar la firma hace falta la clave secreta o la clave pública del emisor. Decodificar solo muestra lo que el token dice, no si es auténtico.',
      },
    ],
    en: [
      {
        q: 'Is the token stored?',
        a: 'No. This tool never stores what you paste, not even in your browser, because a JWT usually grants access to an account.',
      },
      {
        q: 'Does it check the signature?',
        a: 'No. Verifying the signature needs the issuer’s secret or public key. Decoding only shows what the token says, not whether it is genuine.',
      },
    ],
  },
};
