// ===== Textos de las herramientas para la web =====
//
// Genera media/out/labels.json: por idioma, una entrada por herramienta con el nombre y la URL
// (sacados del sitio construido, como en shots.mjs), la imagen y los textos a mano de TEXTS
// (alt: lo que se ve en la captura; caption: el pie; text: una frase de para qué sirve).
// Valida que no falte ningún texto y que cada PNG exista ya en media/out.
//
// Uso: node media/shots/labels.mjs  (después de shots.mjs; no reconstruye el sitio)

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OUT, SITE, chromium, discoverTools, startServer } from './lib.mjs';
import { buildScenes } from './scenes.mjs';

const t = (alt, caption, text) => ({ alt, caption, text });

const TEXTS = {
  uuid: {
    es: t(
      'Ocho UUID v4 generados, cada uno con su botón de copiar.',
      'Ocho UUID v4 de golpe',
      'UUID v4 y v7, ULID y NanoID en lote, y un validador que dice qué versión es.',
    ),
    en: t(
      'Eight generated UUID v4, each with its own copy button.',
      'Eight UUID v4 at once',
      'UUID v4 and v7, ULID and NanoID in bulk, plus a validator that tells you the version.',
    ),
  },
  lorem: {
    es: t(
      'Tres párrafos de Lorem ipsum con recuento de palabras y caracteres.',
      'Tres párrafos de relleno',
      'Texto de relleno por párrafos, frases o palabras, en texto plano o en HTML.',
    ),
    en: t(
      'Three paragraphs of Lorem ipsum with word and character counts.',
      'Three paragraphs of filler',
      'Placeholder text by paragraphs, sentences or words, as plain text or HTML.',
    ),
  },
  mock: {
    es: t(
      'Ocho filas de personas ficticias en CSV generadas con la semilla «demo».',
      'CSV de prueba con semilla',
      'Hasta 1000 filas de datos ficticios coherentes en JSON, CSV o SQL.',
    ),
    en: t(
      'Eight rows of fictional people as CSV, generated with the seed “demo”.',
      'Seeded mock CSV',
      'Up to 1000 rows of consistent fake data as JSON, CSV or SQL.',
    ),
  },
  password: {
    es: t(
      'Cinco contraseñas de 24 caracteres con su entropía, en el tema terminal.',
      'Cinco contraseñas fuertes',
      'Contraseñas aleatorias con longitud, juegos de caracteres y entropía a la vista.',
    ),
    en: t(
      'Five 24-character passwords with their entropy, in the terminal theme.',
      'Five strong passwords',
      'Random passwords with length, character sets and entropy in plain sight.',
    ),
  },
  qr: {
    es: t(
      'Código QR de la URL devtools.alvarotc.com listo para descargar.',
      'QR de una URL',
      'Códigos QR de texto, URL o WiFi, descargables en PNG o SVG.',
    ),
    en: t(
      'QR code for the URL devtools.alvarotc.com, ready to download.',
      'QR for a URL',
      'QR codes for text, URLs or WiFi, downloadable as PNG or SVG.',
    ),
  },
  slug: {
    es: t(
      'Un título con tildes y signos convertido en slug para URL.',
      'Título a slug',
      'Convierte títulos en slugs limpios: sin tildes, eñes ni símbolos.',
    ),
    en: t(
      'A title with accents and punctuation turned into a URL slug.',
      'Title to slug',
      'Turns titles into clean slugs: no accents, no symbols.',
    ),
  },
  base64: {
    es: t(
      'Un JSON corto codificado en Base64 al escribir.',
      'Texto a Base64',
      'Codifica y decodifica Base64 con detección automática, también archivos.',
    ),
    en: t(
      'A short JSON encoded to Base64 as you type.',
      'Text to Base64',
      'Encodes and decodes Base64 with auto-detection, files included.',
    ),
  },
  url: {
    es: t(
      'Una URL de tienda desglosada en protocolo, host, puerto, ruta y parámetros.',
      'Una URL, pieza a pieza',
      'Codifica URLs y desglosa cualquier dirección con sus parámetros decodificados.',
    ),
    en: t(
      'A shop URL broken down into protocol, host, port, path and parameters.',
      'A URL, piece by piece',
      'Encodes URLs and breaks any address down with its decoded parameters.',
    ),
  },
  'html-entities': {
    es: t(
      'Un párrafo HTML con símbolos convertido a entidades.',
      'HTML a entidades',
      'Convierte < > & y comillas en entidades HTML, y al revés.',
    ),
    en: t(
      'An HTML paragraph with symbols converted to entities.',
      'HTML to entities',
      'Turns < > & and quotes into HTML entities, and back.',
    ),
  },
  jwt: {
    es: t(
      'Un JWT de demo decodificado: vigente hasta mañana, con cabecera y payload.',
      'Un JWT vigente',
      'Cabecera, payload y caducidad de un JWT, sin que salga del navegador.',
    ),
    en: t(
      'A demo JWT decoded: valid until tomorrow, with header and payload.',
      'A valid JWT',
      'A JWT’s header, payload and expiry, without leaving the browser.',
    ),
  },
  hash: {
    es: t(
      'MD5, SHA-1, SHA-256, SHA-384 y SHA-512 de un texto, con el SHA-256 comprobado.',
      'Cinco hashes y una comprobación',
      'MD5 y la familia SHA de un texto o archivo, con comparación contra un hash esperado.',
    ),
    en: t(
      'MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of a text, with the SHA-256 checked.',
      'Five hashes and a match',
      'MD5 and the SHA family for text or files, compared against an expected hash.',
    ),
  },
  json: {
    es: t(
      'Un pedido en JSON minificado, ya formateado y validado.',
      'JSON formateado',
      'Formatea, valida y minifica JSON, con la línea exacta de cada error y vista de árbol.',
    ),
    en: t(
      'A minified order JSON, formatted and validated.',
      'Formatted JSON',
      'Formats, validates and minifies JSON, with the exact error line and a tree view.',
    ),
  },
  diff: {
    es: t(
      'Dos versiones de un fichero de configuración con las líneas y palabras cambiadas marcadas.',
      'Diferencias en una config',
      'Compara dos textos y marca líneas y palabras añadidas o quitadas.',
    ),
    en: t(
      'Two versions of a config file with changed lines and words highlighted.',
      'Diff of a config',
      'Compares two texts and marks added or removed lines and words.',
    ),
  },
  regex: {
    es: t(
      'Una expresión con grupos con nombre que encuentra tres correos en un texto.',
      'Tres correos encontrados',
      'Prueba expresiones regulares con resaltado, grupos con nombre y errores explicados.',
    ),
    en: t(
      'A pattern with named groups finding three emails in a text.',
      'Three emails found',
      'Tests regular expressions with highlighting, named groups and explained errors.',
    ),
  },
  text: {
    es: t(
      'Una frase en MAYÚSCULAS, camelCase, snake_case y el resto de formatos.',
      'Diez formas de escribirlo',
      'Pasa un texto a diez formatos de mayúsculas y ordena o limpia líneas.',
    ),
    en: t(
      'A phrase in UPPER CASE, camelCase, snake_case and the other formats.',
      'Ten ways to write it',
      'Converts text into ten case styles and sorts or cleans lines.',
    ),
  },
  'data-convert': {
    es: t(
      'Un CSV con punto y coma detectado y convertido a JSON.',
      'CSV a JSON',
      'Convierte entre JSON, YAML y CSV detectando el formato y el separador.',
    ),
    en: t(
      'A CSV detected and converted to JSON.',
      'CSV to JSON',
      'Converts between JSON, YAML and CSV, detecting format and separator.',
    ),
  },
  'json-diff': {
    es: t(
      'Dos JSON de un plan comparados: versión y plazas cambiadas, dos claves nuevas.',
      'Qué cambió entre dos JSON',
      'Compara dos JSON por estructura, sin importar el orden de las claves.',
    ),
    en: t(
      'Two plan JSONs compared: version and seats changed, two new keys.',
      'What changed between two JSONs',
      'Compares two JSONs by structure, regardless of key order.',
    ),
  },
  markdown: {
    es: t(
      'Notas de versión en Markdown con lista de tareas, tabla y código, ya renderizadas.',
      'Markdown al momento',
      'Vista previa de Markdown con tablas y listas de tareas, y el HTML ya saneado.',
    ),
    en: t(
      'Release notes in Markdown with a task list, table and code, rendered live.',
      'Live Markdown',
      'Markdown preview with tables and task lists, plus sanitized HTML.',
    ),
  },
  curl: {
    es: t(
      'Un POST de cURL con cabeceras y cuerpo JSON convertido a fetch.',
      'cURL a fetch',
      'Pega un comando cURL y obtén el fetch equivalente, con cuerpo y cabeceras.',
    ),
    en: t(
      'A cURL POST with headers and a JSON body converted to fetch.',
      'cURL to fetch',
      'Paste a cURL command and get the equivalent fetch call, body and headers included.',
    ),
  },
  'query-string': {
    es: t(
      'Una query string con corchetes y claves repetidas convertida a JSON anidado.',
      'Query string a JSON',
      'Convierte query strings en JSON y al revés, con corchetes y claves repetidas.',
    ),
    en: t(
      'A query string with brackets and repeated keys turned into nested JSON.',
      'Query string to JSON',
      'Turns query strings into JSON and back, with brackets and repeated keys.',
    ),
  },
  dni: {
    es: t(
      'El DNI de ejemplo 12345678Z validado, con su número y su letra.',
      'DNI válido',
      'Comprueba DNI y NIE, calcula la letra y genera documentos ficticios.',
    ),
    en: t(
      'The sample DNI 12345678Z validated, with its number and check letter.',
      'Valid DNI',
      'Checks Spanish DNI and NIE, works out the letter and generates fake ones.',
    ),
  },
  cif: {
    es: t(
      'Un CIF de sociedad limitada validado, con su tipo de entidad y control.',
      'CIF de una S.L.',
      'Valida el CIF de una empresa y dice el tipo de entidad.',
    ),
    en: t(
      'A limited company CIF validated, with its entity type and check digit.',
      'A company CIF',
      'Validates a Spanish company CIF and tells you the entity type.',
    ),
  },
  iban: {
    es: t(
      'Un IBAN español de ejemplo desglosado en entidad, oficina, control y cuenta.',
      'IBAN desglosado',
      'Valida IBAN de cualquier país y desglosa la cuenta española.',
    ),
    en: t(
      'A sample Spanish IBAN broken into bank, branch, check digits and account.',
      'IBAN broken down',
      'Validates IBANs from any country and breaks down Spanish accounts.',
    ),
  },
  plate: {
    es: t(
      'Una matrícula provincial antigua de Madrid validada en el tema terminal.',
      'Matrícula de Madrid',
      'Comprueba matrículas actuales y provinciales, y genera matrículas de prueba.',
    ),
    en: t(
      'An old provincial Madrid plate validated, in the terminal theme.',
      'A Madrid plate',
      'Checks current and provincial Spanish plates and generates test ones.',
    ),
  },
  nss: {
    es: t(
      'Un número de la Seguridad Social ficticio con provincia y dígitos de control.',
      'Nº de afiliación válido',
      'Comprueba los dígitos de control del NSS y dice la provincia.',
    ),
    en: t(
      'A fictional Social Security number with its province and check digits.',
      'Valid NSS',
      'Checks the Spanish Social Security number and tells you the province.',
    ),
  },
  card: {
    es: t(
      'Diez números de tarjeta Visa de prueba generados con semilla.',
      'Tarjetas de prueba',
      'Genera y valida números de tarjeta de prueba que pasan Luhn.',
    ),
    en: t(
      'Ten test Visa card numbers generated with a seed.',
      'Test cards',
      'Generates and validates test card numbers that pass Luhn.',
    ),
  },
  phone: {
    es: t(
      'Un móvil español de ejemplo en formato nacional, internacional y E.164.',
      'Móvil a E.164',
      'Clasifica teléfonos españoles y los pasa a E.164.',
    ),
    en: t(
      'A sample Spanish mobile in national, international and E.164 formats.',
      'Mobile to E.164',
      'Classifies Spanish phone numbers and converts them to E.164.',
    ),
  },
  bic: {
    es: t(
      'Un código BIC desglosado en banco, país, localidad y sucursal.',
      'BIC desglosado',
      'Valida códigos SWIFT/BIC de 8 u 11 caracteres y los desglosa.',
    ),
    en: t(
      'A BIC code broken down into bank, country, location and branch.',
      'BIC broken down',
      'Validates 8 or 11 character SWIFT/BIC codes and breaks them down.',
    ),
  },
  'ean-isbn': {
    es: t(
      'Un ISBN-10 validado con su equivalente ISBN-13.',
      'ISBN-10 a ISBN-13',
      'Comprueba códigos EAN-13 e ISBN y calcula el dígito que falta.',
    ),
    en: t(
      'An ISBN-10 validated with its ISBN-13 equivalent.',
      'ISBN-10 to ISBN-13',
      'Checks EAN-13 and ISBN codes and works out the missing digit.',
    ),
  },
  'postal-code': {
    es: t(
      'El código postal 29015 con su provincia, comunidad y capital.',
      'Código postal de Málaga',
      'De código postal a provincia y comunidad, recuperando el 0 inicial.',
    ),
    en: t(
      'Postcode 29015 with its province, region and capital.',
      'A Málaga postcode',
      'From Spanish postcode to province and region, restoring the leading zero.',
    ),
  },
  timestamp: {
    es: t(
      'Reloj Unix en vivo y un timestamp convertido a ISO, UTC y hora de Madrid.',
      'Timestamp a fecha',
      'Timestamps Unix en segundos o milisegundos a fecha, en cualquier zona horaria.',
    ),
    en: t(
      'Live Unix clock and a timestamp converted to ISO, UTC and Madrid time.',
      'Timestamp to date',
      'Unix timestamps in seconds or milliseconds to dates, in any time zone.',
    ),
  },
  color: {
    es: t(
      'Un naranja en HEX, RGB, HSL y OKLCH, con su contraste WCAG.',
      'Un color, cuatro formatos',
      'Convierte colores entre HEX, RGB, HSL y OKLCH y comprueba el contraste.',
    ),
    en: t(
      'An orange in HEX, RGB, HSL and OKLCH, with its WCAG contrast.',
      'One color, four formats',
      'Converts colors between HEX, RGB, HSL and OKLCH and checks contrast.',
    ),
  },
  'number-base': {
    es: t(
      'El número 48879 en binario, octal, hexadecimal (BEEF) y base 36.',
      'De decimal a BEEF',
      'Convierte números entre bases de 2 a 36, sin límite de tamaño.',
    ),
    en: t(
      'The number 48879 in binary, octal, hexadecimal (BEEF) and base 36.',
      'From decimal to BEEF',
      'Converts numbers between bases 2 to 36, with no size limit.',
    ),
  },
  units: {
    es: t(
      'Los 42,195 km de un maratón en todas las unidades de longitud.',
      'Un maratón en todas las unidades',
      'Longitud, masa, temperatura, volumen, área, velocidad y datos, todo a la vez.',
    ),
    en: t(
      'A marathon’s 42.195 km in every length unit.',
      'A marathon in every unit',
      'Length, mass, temperature, volume, area, speed and data, all at once.',
    ),
  },
  currency: {
    es: t(
      '250 euros en dólares y en el resto de divisas, con tipos del BCE de ejemplo.',
      'Euros a dólares',
      'Convierte divisas con los tipos de referencia del BCE, también sin conexión.',
    ),
    en: t(
      '250 euros in dollars and every other currency, with sample ECB rates.',
      'Euros to dollars',
      'Converts currencies with ECB reference rates, offline too.',
    ),
  },
  'px-rem': {
    es: t(
      '24 px convertidos a rem y em, con el CSS listo y una tabla de tamaños.',
      '24 px a rem',
      'Píxeles a rem y em con tu tamaño base, y el CSS listo para copiar.',
    ),
    en: t(
      '24 px converted to rem and em, with ready CSS and a size table.',
      '24 px to rem',
      'Pixels to rem and em with your base size, and the CSS ready to copy.',
    ),
  },
  chmod: {
    es: t(
      'Permisos 755 en octal, simbólico y casillas, con la orden chmod.',
      'chmod 755',
      'Permisos Unix de octal a simbólico y al revés, con la orden lista.',
    ),
    en: t(
      '755 permissions in octal, symbolic and checkboxes, with the chmod command.',
      'chmod 755',
      'Unix permissions from octal to symbolic and back, with the command ready.',
    ),
  },
  'file-size': {
    es: t(
      '1 TB en unidades SI y binarias: por qué un disco muestra 931 GiB.',
      'Por qué 1 TB son 931 GiB',
      'Tamaños de archivo en unidades SI y binarias, en bytes y en bits.',
    ),
    en: t(
      '1 TB in SI and binary units: why a drive shows 931 GiB.',
      'Why 1 TB is 931 GiB',
      'File sizes in SI and binary units, in bytes and bits.',
    ),
  },
  iva: {
    es: t(
      'IVA del 21 % sobre 1250 €, con el total y la misma base a otros tipos.',
      'IVA de una factura',
      'Suma o quita el IVA al 21, 10 o 4 %, redondeado al céntimo.',
    ),
    en: t(
      '21% Spanish VAT on €1,250, with the total and the same base at other rates.',
      'VAT on an invoice',
      'Adds or removes Spanish VAT at 21, 10 or 4%, rounded to the cent.',
    ),
  },
  irpf: {
    es: t(
      'Factura de 2400 € con IVA del 21 % y retención del 15 %, desglosada.',
      'Factura de autónomo',
      'Factura de autónomo con IVA y retención de IRPF, desde la base o el líquido.',
    ),
    en: t(
      'A €2,400 invoice with 21% VAT and 15% withholding, broken down.',
      'A freelancer invoice',
      'Spanish freelancer invoices with VAT and IRPF withholding, from base or net.',
    ),
  },
  percent: {
    es: t(
      'El 21 % de 1250, con el recargo y el descuento correspondientes.',
      'El 21 % de 1250',
      'X % de Y, qué porcentaje es y variación porcentual entre dos valores.',
    ),
    en: t(
      '21% of 1,250, with the matching markup and discount.',
      '21% of 1,250',
      'X% of Y, what percentage it is and percentage change between two values.',
    ),
  },
  'rule-of-three': {
    es: t(
      'Una regla de tres directa resuelta con la fórmula a la vista.',
      'Regla de tres directa',
      'Reglas de tres directas e inversas con la fórmula y los números.',
    ),
    en: t(
      'A direct rule of three solved with the formula in plain sight.',
      'Direct rule of three',
      'Direct and inverse rules of three with the formula and the numbers.',
    ),
  },
  workdays: {
    es: t(
      'Días hábiles de diciembre de 2026, con los festivos nacionales del rango.',
      'Diciembre de 2026',
      'Días naturales, laborables y hábiles entre dos fechas, con festivos de España.',
    ),
    en: t(
      'Business days in December 2026, with the national holidays in range.',
      'December 2026',
      'Calendar, weekdays and business days between two dates, with Spain’s holidays.',
    ),
  },
  wheel: {
    es: t(
      'Una ruleta de seis nombres que acaba de elegir a uno.',
      'Ruleta de nombres',
      'Gira una ruleta con tus opciones, con historial y opción de quitar la ganadora.',
    ),
    en: t(
      'A six-name wheel that has just picked one.',
      'Name wheel',
      'Spins a wheel with your options, with history and remove-the-winner.',
    ),
  },
  shuffle: {
    es: t(
      'Una lista de ocho nombres mezclada con la semilla «demo».',
      'Lista mezclada',
      'Mezcla una lista al azar, con semilla para repetir el orden.',
    ),
    en: t(
      'A list of eight names shuffled with the seed “demo”.',
      'Shuffled list',
      'Shuffles a list at random, with a seed to repeat the order.',
    ),
  },
  teams: {
    es: t(
      'Diez personas repartidas en dos equipos equilibrados.',
      'Dos equipos',
      'Reparte personas en equipos equilibrados por número o por tamaño.',
    ),
    en: t(
      'Ten people split into two balanced teams.',
      'Two teams',
      'Splits people into balanced teams by count or by size.',
    ),
  },
  dice: {
    es: t(
      'Una tirada de 3d6+2 con cada dado, la suma y el total.',
      'Tirada de 3d6+2',
      'Dados con notación de rol y lanzamiento de moneda, con semilla opcional.',
    ),
    en: t(
      'A 3d6+2 roll showing each die, the sum and the total.',
      'A 3d6+2 roll',
      'Dice in tabletop notation and coin flips, with an optional seed.',
    ),
  },
  'http-status': {
    es: t(
      'Los códigos HTTP 40x con su significado y la RFC que los define.',
      'Los 40x',
      'Todos los códigos de estado HTTP con su significado y cuándo usarlos.',
    ),
    en: t(
      'HTTP 40x codes with their meaning and defining RFC.',
      'The 40x codes',
      'Every HTTP status code with its meaning and when to use it.',
    ),
  },
  cron: {
    es: t(
      'La expresión 30 9 * * 1-5 explicada con sus próximas ejecuciones en Madrid.',
      'Cron en palabras',
      'Traduce expresiones cron a palabras y calcula las próximas ejecuciones.',
    ),
    en: t(
      'The expression 30 9 * * 1-5 explained, with its next runs in Madrid.',
      'Cron in words',
      'Translates cron expressions into words and lists the next runs.',
    ),
  },
  'user-agent': {
    es: t(
      'Un User-Agent de Safari en iPhone desglosado en navegador, motor y sistema.',
      'Safari en iPhone',
      'Analiza un User-Agent: navegador, motor, sistema, dispositivo y si es un bot.',
    ),
    en: t(
      'A Safari on iPhone User-Agent broken into browser, engine and OS.',
      'Safari on iPhone',
      'Parses a User-Agent: browser, engine, OS, device and whether it is a bot.',
    ),
  },
  semver: {
    es: t(
      'Seis versiones comprobadas contra el rango ^1.2.3, explicado en palabras.',
      'Qué cumple ^1.2.3',
      'Comprueba qué versiones cumplen un rango semver de npm y lo explica.',
    ),
    en: t(
      'Six versions checked against the range ^1.2.3, explained in words.',
      'What satisfies ^1.2.3',
      'Checks which versions satisfy an npm semver range and explains it.',
    ),
  },
  cidr: {
    es: t(
      'La subred 192.168.1.10/24 con red, máscara, broadcast y hosts útiles.',
      'Una /24',
      'Calcula red, máscara, broadcast y rango de hosts de una subred IPv4.',
    ),
    en: t(
      'The subnet 192.168.1.10/24 with network, mask, broadcast and usable hosts.',
      'A /24',
      'Works out network, mask, broadcast and host range of an IPv4 subnet.',
    ),
  },
};

function buildEntries(scenes, lang) {
  return scenes.map((scene) => {
    const { tool, file } = scene;
    const txt = TEXTS[tool.id]?.[lang];
    if (!txt) throw new Error(`${tool.id}: falta el idioma "${lang}" en TEXTS`);
    const image = `${file}-${lang}.png`;
    const entry = {
      id: tool.id,
      image,
      theme: scene.theme,
      href: SITE + tool.path[lang],
      name: tool.name[lang],
      group: tool.categoryName[lang],
      alt: txt.alt,
      caption: txt.caption,
      text: txt.text,
    };
    for (const [campo, valor] of Object.entries(entry)) {
      if (typeof valor !== 'string' || valor.trim() === '') {
        throw new Error(`${tool.id} (${lang}): el campo "${campo}" está vacío`);
      }
    }
    if (!existsSync(join(OUT, image))) throw new Error(`${image}: no existe en ${OUT}`);
    return entry;
  });
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  let tools;
  try {
    tools = await discoverTools(browser, server.url);
  } finally {
    await browser.close();
    await server.stop();
  }
  const sobran = Object.keys(TEXTS).filter((id) => !tools.some((x) => x.id === id));
  if (sobran.length) throw new Error(`TEXTS tiene herramientas que ya no existen: ${sobran}`);

  const scenes = buildScenes(tools).filter((s) => s.tool);
  const data = {
    count: scenes.length,
    es: buildEntries(scenes, 'es'),
    en: buildEntries(scenes, 'en'),
  };
  const outPath = join(OUT, 'labels.json');
  await mkdir(OUT, { recursive: true });
  await writeFile(outPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`labels.json escrito en ${outPath} (${data.es.length} + ${data.en.length} entradas)`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
