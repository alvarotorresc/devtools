import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'qr',
  category: 'gen',
  icon: 'qr-code',
  slug: { es: 'generador-codigo-qr', en: 'qr-code-generator' },
  name: { es: 'Código QR', en: 'QR code' },
  title: {
    es: 'Generador de códigos QR: texto, URL y WiFi (PNG y SVG)',
    en: 'QR code generator: text, URL and WiFi (PNG, SVG)',
  },
  description: {
    es: 'Crea códigos QR de texto, enlaces o redes WiFi en tu navegador y descárgalos en PNG o SVG. Con tildes, emojis y el nivel de corrección que elijas.',
    en: 'Create QR codes for text, links or WiFi networks in your browser and download them as PNG or SVG. With accents, emojis and the error correction you choose.',
  },
  keywords: {
    es: ['generador qr', 'codigo qr', 'crear qr', 'qr wifi', 'qr de una url', 'qr svg'],
    en: [
      'qr code generator',
      'create qr code',
      'wifi qr code',
      'qr code for url',
      'qr svg',
      'qr png',
    ],
  },
  tabs: { es: ['Texto', 'URL', 'WiFi'], en: ['Text', 'URL', 'WiFi'] },
  faq: {
    es: [
      {
        q: '¿Qué nivel de corrección elijo?',
        a: 'M sirve para casi todo. Con H el código aguanta hasta un 30 % de daño o un logo encima, pero necesita más módulos y admite menos texto. L da el código más pequeño para textos largos.',
      },
      {
        q: '¿Se guarda la contraseña de mi WiFi?',
        a: 'No. El nombre de la red se puede recordar en este navegador, pero la contraseña nunca se guarda. Todo el código QR se genera en tu equipo.',
      },
    ],
    en: [
      {
        q: 'Which error correction level should I pick?',
        a: 'M works for almost everything. With H the code survives up to 30 % damage or a logo on top, but it needs more modules and holds less text. L gives the smallest code for long texts.',
      },
      {
        q: 'Is my WiFi password saved?',
        a: 'No. The network name can be remembered in this browser, but the password is never stored. The whole QR code is generated on your device.',
      },
    ],
  },
};
