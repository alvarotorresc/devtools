import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'query-string',
  category: 'data',
  icon: 'file-braces',
  slug: { es: 'conversor-query-string-json', en: 'query-string-to-json' },
  name: { es: 'Query string', en: 'Query string' },
  title: {
    es: 'Conversor de query string a JSON y viceversa',
    en: 'Query string to JSON converter and back',
  },
  heading: {
    es: 'Conversor de query string',
    en: 'Query string to JSON',
  },
  description: {
    es: 'Convierte los parámetros de una URL en JSON y un JSON en query string, con notación de corchetes, claves repetidas y todo decodificado para leerlo.',
    en: 'Turn the parameters of a URL into JSON and JSON into a query string, with bracket notation, repeated keys and everything decoded so you can read it.',
  },
  keywords: {
    es: [
      'query string a json',
      'parametros url',
      'json a query string',
      'urlsearchparams',
      'decodificar url',
      'querystring',
    ],
    en: [
      'query string to json',
      'url parameters',
      'json to query string',
      'urlsearchparams',
      'parse query string',
      'querystring',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Qué es la notación con corchetes?',
        a: 'Es la forma en que PHP, Rails y la librería qs de Node envían objetos y listas por la URL: filtro[precio]=10 es un objeto y tags[]=a&tags[]=b, una lista. Si tu servidor no la usa, desactívala y las claves se leen tal cual.',
      },
      {
        q: '¿Se guarda lo que pego?',
        a: 'Solo en tu navegador y si tienes activado «Recordar lo que escribo». Aun así, si alguna clave parece una credencial (token, password, api_key, session…), no se guarda.',
      },
    ],
    en: [
      {
        q: 'What is bracket notation?',
        a: 'It is how PHP, Rails and the Node qs library send objects and lists in a URL: filter[price]=10 is an object and tags[]=a&tags[]=b is a list. If your server does not use it, turn it off and keys are read as they are.',
      },
      {
        q: 'Is what I paste saved?',
        a: 'Only in your browser, and only with “Remember what I type” on. Even then, if any key looks like a credential (token, password, api_key, session…), it is not saved.',
      },
    ],
  },
  related: ['url', 'json', 'curl'],
};
