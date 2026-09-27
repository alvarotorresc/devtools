import type { Locale } from '../types';

export const strings = {
  es: {
    input: 'Comando cURL',
    placeholder:
      'curl -X POST https://api.example.com/users -H \'Content-Type: application/json\' -d \'{"name":"Ana"}\'',
    result: 'Código fetch',
    converted: 'Convertido',
    empty: 'Pega un comando que empiece por curl y aquí verás el código fetch.',
    warnings: 'Avisos',
    notSaved: 'Lo que pegas aquí no se guarda: un cURL copiado suele llevar cookies y tokens.',
    copyCode: 'Copiar código',
    unclosedQuote:
      'Hay una comilla sin cerrar: revisa que cada comilla simple y doble tenga su pareja',
    windows:
      'Parece un cURL de Windows (cmd), que no se admite. Copia el comando como "cURL (bash)"',
    notCurl: 'El comando debe empezar por curl',
    noUrl: 'Falta la URL: añádela después de curl',
    missingValue: 'A la opción {option} le falta su valor',
    badTimeout: 'El tiempo máximo debe ser un número de segundos mayor que 0, no «{value}»',
    unknownOption: 'Opción ignorada: {option}',
    dataFile: 'fetch no puede leer archivos: sustituye @{file} por su contenido',
    formFile:
      'El campo {name} sube el archivo {file}: fetch no puede leerlo del disco. Pásale un File de un <input type="file">',
    userAgent:
      'El navegador no deja cambiar User-Agent y fetch ignora esa cabecera. En Node sí funciona.',
    cookie:
      "En el navegador, fetch ignora la cabecera Cookie: usa credentials: 'include' para que mande las cookies del sitio.",
    insecure: 'fetch no puede ignorar errores de certificado (-k)',
    duplicateHeader: 'La cabecera {name} aparece varias veces: se usa la última',
    badHeader: 'Cabecera sin «:» ignorada: {text}',
    extraArgument: 'Argumento ignorado: {text}',
    noScheme: 'La URL no tiene esquema: se añade http://, como hace curl',
    methodDropsBody:
      'fetch no puede enviar cuerpo con el método {method}: se ha omitido para que el código funcione',
  },
  en: {
    input: 'cURL command',
    placeholder:
      'curl -X POST https://api.example.com/users -H \'Content-Type: application/json\' -d \'{"name":"Ana"}\'',
    result: 'fetch code',
    converted: 'Converted',
    empty: 'Paste a command that starts with curl and the fetch code will show up here.',
    warnings: 'Notes',
    notSaved: 'What you paste here is not saved: a copied cURL usually carries cookies and tokens.',
    copyCode: 'Copy code',
    unclosedQuote:
      'There is an unclosed quote: check that every single and double quote has its pair',
    windows:
      'This looks like a Windows (cmd) cURL, which is not supported. Copy the command as "cURL (bash)"',
    notCurl: 'The command must start with curl',
    noUrl: 'The URL is missing: add it after curl',
    missingValue: 'The option {option} needs a value',
    badTimeout: 'The maximum time must be a number of seconds above 0, not “{value}”',
    unknownOption: 'Option ignored: {option}',
    dataFile: 'fetch cannot read files: replace @{file} with its content',
    formFile:
      'The field {name} uploads the file {file}: fetch cannot read it from disk. Pass it a File from an <input type="file">',
    userAgent:
      'Browsers do not let you change User-Agent and fetch ignores that header. It works in Node.',
    cookie:
      "In the browser, fetch ignores the Cookie header: use credentials: 'include' so it sends the site's cookies.",
    insecure: 'fetch cannot ignore certificate errors (-k)',
    duplicateHeader: 'The header {name} appears more than once: the last one is used',
    badHeader: 'Header without “:” ignored: {text}',
    extraArgument: 'Argument ignored: {text}',
    noScheme: 'The URL has no scheme: http:// is added, like curl does',
    methodDropsBody:
      'fetch cannot send a body with the {method} method: it was left out so the code works',
  },
} satisfies Record<Locale, Record<string, string>>;
