// Only type imports here: scripts/og.mjs loads this file straight from Node.
import type { Category } from './types';

export const categories: Category[] = [
  {
    id: 'gen',
    icon: 'sparkles',
    slug: { es: 'generadores', en: 'generators' },
    name: { es: 'Generadores', en: 'Generators' },
    description: {
      es: 'Identificadores, textos de relleno y datos de prueba.',
      en: 'Identifiers, placeholder text and test data.',
    },
    title: {
      es: 'Generadores online: UUID, contraseñas, QR y slugs',
      en: 'Online generators: UUID, passwords, QR and slugs',
    },
    heading: { es: 'Generadores para desarrolladores', en: 'Generators for developers' },
    seoDescription: {
      es: 'Genera UUID, ULID y NanoID, contraseñas seguras, códigos QR, slugs para URL, lorem ipsum y datos de prueba en JSON, CSV o SQL, en tu navegador.',
      en: 'Generate UUID, ULID and NanoID, strong passwords, QR codes, URL slugs, lorem ipsum and mock data as JSON, CSV or SQL, all inside your browser.',
    },
    intro: {
      es: [
        'Seis herramientas para cuando necesitas algo que todavía no existe: un identificador para una fila nueva, una contraseña para una cuenta de servicio, un QR para la wifi de la oficina o un slug para el artículo que vas a publicar. El generador de UUID saca hasta 500 de golpe en v4 o v7, o en ULID y NanoID si prefieres algo más corto u ordenable por fecha.',
        'Para maquetar y probar, el lorem ipsum te da párrafos, frases o palabras, ya envueltos en <p> si los quieres en HTML, y el generador de datos de prueba crea hasta mil filas con nombres, emails, DNI e IBAN coherentes entre sí, en JSON, CSV o SQL. Con una semilla salen siempre las mismas filas, así que un test que falla hoy falla igual mañana. Las contraseñas se generan con crypto.getRandomValues y no se guardan en ningún sitio.',
      ],
      en: [
        'Six tools for when you need something that does not exist yet: an ID for a new row, a password for a service account, a QR code for the office WiFi or a slug for the post you are about to publish. The UUID generator produces up to 500 at once as v4 or v7, or as ULID and NanoID when you want something shorter or sortable by date.',
        'For layouts and tests, lorem ipsum gives you paragraphs, sentences or words, wrapped in <p> if you need HTML, and the mock data generator builds up to a thousand rows of names, emails, Spanish IDs and IBANs that agree with each other, as JSON, CSV or SQL. With a seed you get the same rows every time, so a test that fails today fails the same way tomorrow. Passwords come from crypto.getRandomValues and are never stored.',
      ],
    },
  },
  {
    id: 'enc',
    icon: 'code',
    slug: { es: 'codificacion', en: 'encoding' },
    name: { es: 'Codificación', en: 'Encoding' },
    description: {
      es: 'Codificar, decodificar e inspeccionar tokens y hashes.',
      en: 'Encode, decode and inspect tokens and hashes.',
    },
    title: {
      es: 'Codificar y decodificar online: Base64, URL, JWT',
      en: 'Encode and decode online: Base64, URL, JWT',
    },
    heading: { es: 'Codificar y decodificar datos', en: 'Encode and decode data' },
    seoDescription: {
      es: 'Codifica y decodifica Base64, URL y entidades HTML, inspecciona la cabecera y el payload de un JWT y calcula hashes MD5 o SHA-256 de textos y archivos.',
      en: 'Encode and decode Base64, URLs and HTML entities, inspect a JWT header and payload, and hash text or files with MD5 or SHA-256, all in your browser.',
    },
    intro: {
      es: [
        'Casi todo lo que viaja entre un navegador y un servidor va transformado de alguna forma: un parámetro con espacios se escapa con %20, una imagen pequeña se incrusta en Base64 dentro de un data URI, un token de sesión es un JWT de tres partes separadas por puntos. Estas cinco herramientas deshacen esas capas para que leas lo que hay debajo, o las aplican cuando eres tú quien tiene que enviar el dato.',
        'El decodificador de JWT enseña la cabecera, el payload y si el token ha caducado, con las fechas en tu hora local; es lo primero que conviene mirar cuando una API responde 401. El generador de hash calcula MD5, SHA-1 y SHA-256 de un texto o un archivo y lo compara con el valor que te han dado, útil para comprobar una descarga. Nada se envía a ningún servidor: un token de producción no debería acabar pegado en una web que lo guarde.',
      ],
      en: [
        'Almost everything that travels between a browser and a server has been transformed on the way: a parameter with spaces is escaped as %20, a small image is embedded as Base64 in a data URI, a session token is a JWT made of three dot-separated parts. These five tools peel those layers off so you can read what is underneath, or apply them when you are the one sending the data.',
        'The JWT decoder shows the header, the payload and whether the token has expired, with dates in your local time; it is the first thing to check when an API answers 401. The hash generator computes MD5, SHA-1 and SHA-256 for text or a file and compares the result with the value you were given, which is handy for verifying a download. Nothing is sent to a server, because a production token should never end up in a site that keeps it.',
      ],
    },
  },
  {
    id: 'data',
    icon: 'braces',
    slug: { es: 'texto-y-datos', en: 'text-and-data' },
    name: { es: 'Texto y datos', en: 'Text & data' },
    description: {
      es: 'Formatear, comparar y transformar texto y JSON.',
      en: 'Format, compare and transform text and JSON.',
    },
    title: {
      es: 'Texto y JSON online: formatear, comparar, regex',
      en: 'Text and JSON tools: format, compare, regex',
    },
    heading: { es: 'Herramientas de texto y JSON', en: 'Text and JSON tools for developers' },
    seoDescription: {
      es: 'Formatea y valida JSON, compara textos, prueba regex, convierte entre JSON, YAML y CSV, pasa un cURL a fetch y previsualiza Markdown en tu navegador.',
      en: 'Format and validate JSON, diff texts, test regex, convert JSON to YAML or CSV, turn cURL into fetch and preview Markdown, right in your browser.',
    },
    intro: {
      es: [
        'Nueve herramientas para el texto que pasa por tus manos a diario: la respuesta de una API que llega en una sola línea, dos versiones de un fichero de configuración que no sabes en qué se diferencian, una expresión regular que casi funciona. El formateador de JSON te señala la línea exacta del error, y el comparador de JSON ignora el orden de las claves para enseñarte solo lo que de verdad ha cambiado.',
        'También hay conversores para mover datos de un formato a otro: JSON a YAML o CSV con los objetos anidados aplanados, una query string a JSON legible, un comando cURL copiado de las herramientas del navegador a código fetch listo para pegar. Y para escribir, una vista previa de Markdown con las tablas y listas de tareas de GitHub y un conversor que pasa un texto a camelCase, snake_case o kebab-case de una vez.',
      ],
      en: [
        'Nine tools for the text you handle every day: an API response that arrives on a single line, two versions of a config file you cannot tell apart, a regular expression that almost works. The JSON formatter points at the exact line of an error, and the JSON diff ignores key order so it only shows what really changed.',
        'There are also converters for moving data between formats: JSON to YAML or CSV with nested objects flattened, a query string into readable JSON, a cURL command copied from the browser’s dev tools into fetch code ready to paste. And for writing, a Markdown preview with GitHub tables and task lists, and a case converter that turns text into camelCase, snake_case or kebab-case in one go.',
      ],
    },
  },
  {
    id: 'ids',
    icon: 'id-card',
    slug: { es: 'identificadores', en: 'identifiers' },
    name: { es: 'Identificadores', en: 'Identifiers' },
    description: {
      es: 'Documentos y códigos oficiales: DNI, IBAN, matrículas, ISBN…',
      en: 'Official documents and codes: DNI, IBAN, plates, ISBN…',
    },
    title: {
      es: 'Validar DNI, NIE, CIF, IBAN y matrículas online',
      en: 'Validate Spanish DNI, NIE, CIF, IBAN and more',
    },
    heading: {
      es: 'Validar DNI, NIE, CIF, IBAN y otros códigos',
      en: 'Spanish ID and code validators',
    },
    seoDescription: {
      es: 'Valida y genera DNI, NIE, CIF, NSS, IBAN, matrículas y teléfonos españoles, comprueba SWIFT, EAN e ISBN y crea tarjetas de prueba que pasan Luhn.',
      en: 'Validate and generate Spanish DNI, NIE, CIF, NSS, IBAN, plates and phone numbers, check SWIFT, EAN and ISBN codes and create Luhn-valid test cards.',
    },
    intro: {
      es: [
        'Diez herramientas para los números que llevan un dígito o una letra de control: el DNI y el NIE, el CIF de una empresa, el número de la Seguridad Social, el IBAN de una cuenta. Cada una te dice si el número es válido y, si no lo es, por qué. La mayoría genera además documentos ficticios que pasan la validación, que es justo lo que hace falta para rellenar un formulario de pruebas sin usar los datos de una persona real.',
        'Casi todos son formatos españoles (matrículas antiguas y nuevas, teléfonos fijos y móviles, códigos postales con su provincia), pero varias herramientas sirven en cualquier país: el IBAN se valida para todos, el SWIFT/BIC se desglosa en banco, país y sucursal, los códigos EAN-13 e ISBN se comprueban y convierten, y el generador de tarjetas crea números Visa, Mastercard y American Express para pasarelas de pago en modo de pruebas.',
      ],
      en: [
        'Ten tools for numbers that carry a check digit or letter: the Spanish DNI and NIE, a company’s CIF, the Social Security number, a bank account’s IBAN. Each one tells you whether a number is valid and, if it is not, why. Most of them also generate fictitious documents that pass validation, which is exactly what you need to fill in a test form without using a real person’s data.',
        'Most are Spanish formats (old and new license plates, mobile and landline numbers, postal codes with their province), but several tools work anywhere: IBANs are validated for every country, a SWIFT/BIC code is broken down into bank, country and branch, EAN-13 barcodes and ISBNs are checked and converted, and the card generator creates Visa, Mastercard and American Express numbers for payment gateways in test mode.',
      ],
    },
  },
  {
    id: 'conv',
    icon: 'arrow-left-right',
    slug: { es: 'conversores', en: 'converters' },
    name: { es: 'Conversores', en: 'Converters' },
    description: {
      es: 'Fechas, colores, bases numéricas y unidades.',
      en: 'Dates, colors, number bases and units.',
    },
    title: {
      es: 'Conversores online: timestamp, colores, px a rem',
      en: 'Online converters: timestamp, color, px to rem',
    },
    heading: { es: 'Conversores de formatos y unidades', en: 'Format and unit converters' },
    seoDescription: {
      es: 'Convierte timestamps Unix, colores HEX, RGB y OKLCH, bases numéricas, px a rem, permisos chmod, tamaños de archivo, unidades y divisas del BCE.',
      en: 'Convert Unix timestamps, HEX, RGB and OKLCH colors, number bases, px to rem, chmod permissions, file sizes, units and currencies at ECB rates.',
    },
    intro: {
      es: [
        'Ocho conversores para valores que significan lo mismo escritos de otra forma. Un timestamp 1700000000 en un log es una fecha concreta en tu zona horaria; el color #ff5a1f es también rgb(255 90 31) y un oklch que puedes retocar; un permiso 755 es rwxr-xr-x. Escribes en cualquier campo y los demás se actualizan al momento, así que sirven igual para ir que para volver.',
        'Algunos resuelven dudas que salen a menudo: por qué un disco de 1 TB aparece como 931 GB (unidades SI frente a binarias), cuánto son 18 px en rem con una base de 16, o qué contraste tiene un color sobre blanco según WCAG. El conversor de divisas usa los tipos de referencia del Banco Central Europeo y hace la cuenta en tu navegador, también sin conexión.',
      ],
      en: [
        'Eight converters for values that mean the same thing written another way. A timestamp of 1700000000 in a log is a specific date in your time zone; the color #ff5a1f is also rgb(255 90 31) and an oklch you can tweak; a 755 permission is rwxr-xr-x. Type into any field and the others update straight away, so they work just as well in both directions.',
        'Some of them answer questions that come up a lot: why a 1 TB drive shows up as 931 GB (SI versus binary units), what 18 px is in rem with a 16 px base, or how much contrast a color has against white under WCAG. The currency converter uses the European Central Bank’s reference rates and does the maths in your browser, even offline.',
      ],
    },
  },
  {
    id: 'calc',
    icon: 'calculator',
    slug: { es: 'calculadoras', en: 'calculators' },
    name: { es: 'Calculadoras', en: 'Calculators' },
    description: {
      es: 'IVA, IRPF, porcentajes, reglas de tres y días hábiles.',
      en: 'VAT, withholding, percentages, rule of three and business days.',
    },
    title: {
      es: 'Calculadoras online: IVA, IRPF, porcentajes',
      en: 'Online calculators: VAT, IRPF, percentages',
    },
    heading: {
      es: 'Calculadoras para facturas y cuentas rápidas',
      en: 'Calculators for invoices and quick maths',
    },
    seoDescription: {
      es: 'Calcula el IVA y la retención de IRPF de una factura, porcentajes y descuentos, reglas de tres directas e inversas y días hábiles con festivos de España.',
      en: 'Work out Spanish VAT and IRPF withholding on an invoice, percentages and discounts, direct and inverse rules of three and business days in Spain.',
    },
    intro: {
      es: [
        'Cinco calculadoras para cuentas que se hacen a menudo y en las que es fácil equivocarse. Las de IVA e IRPF están pensadas para facturar como autónomo en España: partes de la base imponible o de lo que quieres cobrar, eliges el tipo de IVA (21, 10 o 4 %) y la retención (15, 7 o 19 %), y ves el desglose completo con un redondeo al céntimo que cuadra con la factura.',
        'Las otras tres sirven para cualquiera. La de porcentajes saca el X % de un número, qué parte es una cantidad de otra y cuánto ha subido o bajado un precio. La regla de tres enseña la fórmula con tus valores para que veas de dónde sale el resultado. Y la de días hábiles cuenta los laborables entre dos fechas con los festivos nacionales de cualquier año, Viernes Santo incluido, para estimar un plazo de entrega sin contar con los dedos.',
      ],
      en: [
        'Five calculators for sums that come up often and are easy to get wrong. The VAT and IRPF ones are built for invoicing as a freelancer in Spain: start from the net amount or from what you want to be paid, pick the VAT rate (21, 10 or 4%) and the withholding (15, 7 or 19%), and get the full breakdown with cent rounding that matches the invoice.',
        'The other three work for anyone. The percentage calculator finds X% of a number, what share one amount is of another and how much a price went up or down. The rule of three shows the formula with your values so you can see where the answer comes from. And the business days calculator counts working days between two dates with Spain’s national holidays for any year, Good Friday included, so you can estimate a deadline without counting on your fingers.',
      ],
    },
  },
  {
    id: 'rand',
    icon: 'dices',
    slug: { es: 'azar', en: 'random' },
    name: { es: 'Azar', en: 'Random' },
    description: { es: 'Ruletas, sorteos y dados.', en: 'Wheels, draws and dice.' },
    title: {
      es: 'Sorteos online: ruleta, equipos, dados y listas',
      en: 'Random picker online: wheel, teams, dice, lists',
    },
    heading: { es: 'Sorteos y herramientas de azar', en: 'Random picker and draw tools' },
    seoDescription: {
      es: 'Gira una ruleta con tus opciones, reparte personas en equipos al azar, mezcla una lista o lanza dados y monedas. Con semilla para repetir el resultado.',
      en: 'Spin a wheel with your own options, split people into random teams, shuffle a list or roll dice and flip coins. Use a seed to repeat any result.',
    },
    intro: {
      es: [
        'Cuatro herramientas para dejar una decisión al azar sin discutir si el sorteo ha sido limpio. La ruleta admite hasta cien opciones y puede quitar la ganadora después de cada tirada, el generador de equipos reparte una lista de personas en grupos equilibrados y el mezclador ordena una lista al azar con un algoritmo uniforme, en el que todos los órdenes tienen la misma probabilidad.',
        'Sirven para elegir quién presenta en la reunión de equipo, repartir una clase en grupos de trabajo o decidir el orden de las revisiones de código. Los dados entienden la notación de rol (3d6, 2d20+1, d100) y también echan una moneda al aire. Casi todas aceptan una semilla: con la misma semilla sale el mismo resultado, así que cualquiera puede repetir el sorteo y comprobar que nadie ha hecho trampa.',
      ],
      en: [
        'Four tools for leaving a decision to chance without arguing over whether the draw was fair. The wheel takes up to a hundred options and can drop the winner after each spin, the team generator splits a list of people into balanced groups, and the shuffler puts a list in random order with a uniform algorithm, where every order is equally likely.',
        'Use them to pick who presents at the team meeting, split a class into work groups or set the order of code reviews. The dice understand tabletop notation (3d6, 2d20+1, d100) and can also flip a coin. Most of them take a seed: the same seed gives the same result, so anyone can repeat the draw and check that nobody cheated.',
      ],
    },
  },
  {
    id: 'ref',
    icon: 'book-open',
    slug: { es: 'referencia', en: 'reference' },
    name: { es: 'Referencia', en: 'Reference' },
    description: {
      es: 'Chuletas y explicaciones rápidas.',
      en: 'Cheat sheets and quick explanations.',
    },
    title: {
      es: 'Chuletas para devs: HTTP, cron, semver y CIDR',
      en: 'Developer cheat sheets: HTTP, cron, semver, CIDR',
    },
    heading: {
      es: 'Chuletas y referencia para programadores',
      en: 'Developer cheat sheets',
    },
    seoDescription: {
      es: 'Consulta los códigos de estado HTTP, traduce expresiones cron a palabras, comprueba rangos semver, calcula subredes CIDR y analiza cualquier User-Agent.',
      en: 'Look up HTTP status codes, turn cron expressions into plain words, check npm semver ranges, work out CIDR subnets and parse any User-Agent string.',
    },
    intro: {
      es: [
        'Cinco herramientas para esas cosas que se consultan muchas veces y nunca se terminan de memorizar. ¿Qué diferencia hay entre un 401 y un 403? ¿Cuándo se ejecuta 0 9 * * 1-5? ¿Qué versiones acepta ^1.4.0 en el package.json? Cada una responde con tus datos concretos en lugar de mandarte a leer la documentación entera.',
        'La lista de códigos HTTP va del 100 al 511, con el RFC de cada uno y cuándo usarlo. El explicador de cron traduce la expresión a palabras y calcula las próximas ejecuciones en tu zona horaria. La calculadora de subredes saca la red, la máscara, el broadcast y el rango de hosts de una dirección IPv4, y el analizador de User-Agent te dice qué navegador, sistema y dispositivo dice ser una cadena copiada de un log, y si parece un bot.',
      ],
      en: [
        'Five tools for things you look up again and again and never quite memorise. What is the difference between a 401 and a 403? When does 0 9 * * 1-5 run? Which versions does ^1.4.0 accept in package.json? Each one answers with your actual input instead of sending you off to read the whole spec.',
        'The HTTP list covers every code from 100 to 511, with its RFC and when to use it. The cron explainer turns an expression into words and lists the next runs in your time zone. The subnet calculator gives you the network, mask, broadcast and host range of an IPv4 address, and the User-Agent parser tells you which browser, OS and device a string copied from a log claims to be, and whether it looks like a bot.',
      ],
    },
  },
];
