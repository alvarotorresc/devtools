import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'cidr',
  category: 'ref',
  icon: 'network',
  slug: { es: 'calculadora-subredes-cidr', en: 'cidr-subnet-calculator' },
  name: { es: 'Subredes CIDR', en: 'CIDR subnets' },
  title: {
    es: 'Calculadora de subredes IPv4 y CIDR online',
    en: 'CIDR calculator: IPv4 subnet calculator online',
  },
  heading: {
    es: 'Calculadora de subredes',
    en: 'CIDR calculator',
  },
  description: {
    es: 'Calcula red, máscara, broadcast, rango de hosts y direcciones útiles de una subred IPv4 en notación CIDR o con máscara, y di si la IP es privada o pública.',
    en: 'Work out the network, mask, broadcast, host range and usable addresses of an IPv4 subnet in CIDR or mask notation, and whether the IP is private or public.',
  },
  keywords: {
    es: [
      'calculadora de subredes',
      'cidr',
      'mascara de red',
      'calcular broadcast',
      'subred ipv4',
      'rango de ip',
    ],
    en: [
      'subnet calculator',
      'cidr calculator',
      'netmask',
      'broadcast address',
      'ipv4 subnet',
      'ip range',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Por qué una /24 tiene 254 hosts y no 256?',
        a: 'La primera dirección identifica la red y la última es el broadcast, así que no se asignan a equipos. Quedan 2^(32−24) − 2 = 254. En una /31 (enlaces punto a punto, RFC 3021) se usan las dos.',
      },
      {
        q: '¿Qué es la máscara comodín?',
        a: 'Es la máscara invertida (0.0.0.255 para una /24). La usan las listas de acceso de Cisco y algunos cortafuegos para indicar qué bits pueden variar.',
      },
    ],
    en: [
      {
        q: 'Why does a /24 have 254 hosts and not 256?',
        a: 'The first address names the network and the last one is the broadcast, so neither is given to a device. That leaves 2^(32−24) − 2 = 254. In a /31 (point-to-point links, RFC 3021) both are used.',
      },
      {
        q: 'What is the wildcard mask?',
        a: 'It is the inverted mask (0.0.0.255 for a /24). Cisco access lists and some firewalls use it to say which bits may vary.',
      },
    ],
  },
  related: ['number-base', 'chmod', 'user-agent'],
};
