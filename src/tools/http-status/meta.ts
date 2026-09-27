import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'http-status',
  category: 'ref',
  icon: 'server',
  slug: { es: 'codigos-estado-http', en: 'http-status-codes' },
  name: { es: 'Códigos HTTP', en: 'HTTP status codes' },
  title: {
    es: 'Códigos de estado HTTP: lista completa explicada',
    en: 'HTTP status codes: complete list explained',
  },
  description: {
    es: 'Todos los códigos de estado HTTP, del 100 al 511, con su nombre oficial, qué significan, cuándo usarlos y el RFC que los define. Busca por número o palabra.',
    en: 'Every HTTP status code from 100 to 511, with its official name, what it means, when to use it and the RFC that defines it. Search by number or word.',
  },
  keywords: {
    es: [
      'codigos http',
      'codigos de estado http',
      'error 404',
      'error 500',
      'lista codigos http',
      'http status',
    ],
    en: [
      'http status codes',
      'http status code list',
      '404 not found',
      '500 internal server error',
      'http response codes',
      'rest api status codes',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre 401 y 403?',
        a: '401 significa que no te has identificado o que tus credenciales no valen: volver a iniciar sesión puede arreglarlo. 403 significa que el servidor sabe quién eres y aun así no te deja pasar.',
      },
      {
        q: '¿301 o 308? ¿302 o 307?',
        a: 'Los cuatro redirigen. 307 y 308 obligan a repetir la petición con el mismo método y cuerpo; con 301 y 302, muchos clientes convierten un POST en GET. Para cambios permanentes, 301 o 308; para temporales, 302 o 307.',
      },
    ],
    en: [
      {
        q: 'What is the difference between 401 and 403?',
        a: '401 means you are not identified or your credentials are wrong: logging in again may fix it. 403 means the server knows who you are and still will not let you in.',
      },
      {
        q: '301 or 308? 302 or 307?',
        a: 'All four redirect. 307 and 308 require repeating the request with the same method and body; with 301 and 302 many clients turn a POST into a GET. For permanent moves use 301 or 308; for temporary ones, 302 or 307.',
      },
    ],
  },
};
