// ===== Escenas de media/shots =====
//
// Una escena por herramienta, indexada por el id del registro (src/tools/registry.ts), más la
// portada. buildScenes() cruza este mapa con las herramientas que lista el sitio construido:
// si falta una escena o sobra una, lanza, así que una herramienta nueva no se queda sin foto.
//
// Cada escena tiene:
//   theme   -- light (por defecto del sitio), dark o terminal. Alternamos para dar variedad.
//   prep    -- rellena un ejemplo realista con la página ya hidratada, para que la captura
//              enseñe un resultado y no un formulario vacío. Datos ficticios pero verosímiles;
//              ningún dato personal real. Donde hay semilla, se usa "demo".
//   after   -- opcional, se ejecuta tras settle() (p. ej. hacer scroll hasta el resultado).
//   storage -- opcional, claves de localStorage (sin el prefijo devtools:) antes de cargar.

import { createHash } from 'node:crypto';

const T = (es, en) => ({ es, en });

// Pulsa una opción de un grupo de radios (Segmented) por su nombre visible en cada idioma.
async function radio(page, lang, names) {
  await page.getByRole('radio', { name: names[lang], exact: true }).first().click();
}

// Pulsa la pestaña principal número `i` (0 = la primera).
async function tab(page, i) {
  await page.locator('[data-tabs-main] [role="radio"]').nth(i).click();
}

async function fill(page, selector, value) {
  await page.locator(selector).fill(value);
}

// Deja visible el primer elemento que case: útil cuando el resultado cae bajo el pliegue.
function scrollTo(selector, offset = 24) {
  return async (page) => {
    await page.evaluate(
      ({ selector, offset }) => {
        const el = document.querySelector(selector);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo(0, Math.max(0, top));
      },
      { selector, offset },
    );
  };
}

// El DNI de ejemplo de siempre (el mismo que usa el propio texto de la herramienta): se lee como
// marcador, no como el documento de alguien.
const DNI = '12345678Z';

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
// JWT de demo: cabecera y payload reales, firma de relleno (el decodificador no la verifica).
const JWT = [
  b64url({ alg: 'HS256', typ: 'JWT' }),
  b64url({
    sub: 'usr_8f3a21',
    name: 'Marta Ruiz',
    email: 'marta@ejemplo.com',
    role: 'editor',
    iat: 1790584200,
    exp: 1790670600,
  }),
  'Xk1c9vQm3pD2aR8sT5uW7yZ0bC4eF6gH1jK3lM5nP7q',
].join('.');

const HASH_SHA256 = createHash('sha256').update('devtools.alvarotc.com').digest('hex');

const NAMES = ['Ana', 'Luis', 'Eva', 'Marta', 'Pablo', 'Sara', 'Hugo', 'Lucía', 'Iván', 'Noa'];

const PER_TOOL = {
  // ---- Generadores
  uuid: {
    theme: 'light',
    prep: async (page, lang) => {
      await fill(page, '#uuid-count', '8');
      await page.getByRole('button', { name: T('Generar', 'Generate')[lang], exact: true }).click();
    },
  },
  lorem: { theme: 'dark' },
  mock: {
    theme: 'light',
    prep: async (page, lang) => {
      await fill(page, '#mock-seed', 'demo');
      await fill(page, '#mock-rows', '8');
      await radio(page, lang, T('CSV', 'CSV'));
      // En inglés, nombres y campos internacionales (sin DNI).
      if (lang === 'en') await page.getByRole('switch', { name: 'International data' }).check();
    },
    // La lista de campos es larga: se baja hasta que el resultado quede a la vista.
    after: scrollTo('.display', 420),
  },
  password: {
    theme: 'terminal',
    prep: async (page) => {
      await fill(page, '#password-length', '24');
      await fill(page, '#password-count', '5');
    },
  },
  qr: {
    theme: 'light',
    prep: async (page) => {
      await tab(page, 1);
      await fill(page, '#qr-url', 'https://devtools.alvarotc.com');
    },
  },
  slug: {
    theme: 'dark',
    prep: async (page, lang) => {
      await fill(
        page,
        '#slug-input',
        T('¿Cómo validar un IBAN español en 2026?', 'How to validate a Spanish IBAN in 2026?')[
          lang
        ],
      );
    },
  },

  // ---- Codificación
  base64: {
    theme: 'light',
    prep: async (page, lang) => {
      await fill(
        page,
        '#base64-input',
        T(
          '{"usuario":"demo","rol":"editor","activo":true}',
          '{"user":"demo","role":"editor","active":true}',
        )[lang],
      );
    },
  },
  url: {
    theme: 'light',
    prep: async (page) => {
      await fill(
        page,
        '#url-input',
        'https://tienda.ejemplo.com:8443/buscar?q=zapatillas%20trail&talla=42&orden=precio#resultados',
      );
      await tab(page, 1);
    },
  },
  'html-entities': {
    theme: 'dark',
    prep: async (page) => {
      await fill(page, '#html-entities-input', '<p class="precio">Café & té — 3,50 € > 3 €</p>');
    },
  },
  jwt: {
    theme: 'terminal',
    prep: async (page) => {
      await fill(page, '#jwt-input', JWT);
    },
  },
  hash: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#hash-input', 'devtools.alvarotc.com');
      await fill(page, '#hash-compare', HASH_SHA256);
    },
  },

  // ---- Texto y datos
  json: {
    theme: 'light',
    prep: async (page, lang) => {
      const order = T(
        {
          pedido: 'PED-2026-0412',
          cliente: { nombre: 'Ana Gil', ciudad: 'Valencia' },
          lineas: [
            { sku: 'TEC-104', cantidad: 1, precio: 49.9 },
            { sku: 'RAT-221', cantidad: 2, precio: 19.5 },
          ],
          enviado: true,
          total: 88.9,
        },
        {
          order: 'ORD-2026-0412',
          customer: { name: 'Ana Gil', city: 'Valencia' },
          lines: [
            { sku: 'TEC-104', quantity: 1, price: 49.9 },
            { sku: 'RAT-221', quantity: 2, price: 19.5 },
          ],
          shipped: true,
          total: 88.9,
        },
      )[lang];
      await fill(page, '#json-input', JSON.stringify(order));
    },
  },
  diff: {
    theme: 'dark',
    prep: async (page) => {
      await fill(
        page,
        '#diff-original',
        'host: localhost\nport: 8080\nworkers: 2\nlog_level: info\ncache: false',
      );
      await fill(
        page,
        '#diff-modified',
        'host: 0.0.0.0\nport: 8080\nworkers: 4\nlog_level: info\ncache: true\ntimeout: 30',
      );
    },
  },
  regex: {
    theme: 'light',
    prep: async (page, lang) => {
      await fill(page, '#regex-pattern', '(?<usuario>[\\w.]+)@(?<dominio>[\\w-]+\\.\\w+)');
      await fill(
        page,
        '#regex-text',
        T(
          'Escribe a ana.gil@ejemplo.com o a soporte@ejemplo.org.\nFacturas: pagos@ejemplo.org · Sin correo: hola arroba nada',
          'Write to ana.gil@example.com or support@example.org.\nInvoices: billing@example.org · No email: hello at nothing',
        )[lang],
      );
    },
  },
  text: {
    theme: 'terminal',
    prep: async (page, lang) => {
      await fill(page, '#text-input', T('fecha de última conexión', 'last login date')[lang]);
    },
  },
  'data-convert': {
    theme: 'light',
    prep: async (page, lang) => {
      await fill(
        page,
        '#data-convert-input',
        T(
          'nombre;ciudad;pedidos\nAna;Valencia;12\nLuis;Bilbao;7\nEva;Sevilla;21',
          'name,city,orders\nAna,Valencia,12\nLuis,Bilbao,7\nEva,Seville,21',
        )[lang],
      );
    },
  },
  'json-diff': {
    theme: 'dark',
    prep: async (page) => {
      await fill(
        page,
        '#json-diff-a',
        JSON.stringify(
          { version: '1.4.0', plan: 'pro', seats: 5, features: ['sso', 'audit'] },
          null,
          2,
        ),
      );
      await fill(
        page,
        '#json-diff-b',
        JSON.stringify(
          {
            plan: 'pro',
            version: '1.5.0',
            seats: 8,
            features: ['sso', 'audit', 'export'],
            trial: false,
          },
          null,
          2,
        ),
      );
    },
  },
  markdown: {
    theme: 'light',
    prep: async (page, lang) => {
      await fill(
        page,
        '#markdown-input',
        T(
          '# Notas de versión 1.5\n\nNovedades de **esta semana**:\n\n- Exportar a CSV\n- Atajos de teclado\n- [x] Tema terminal\n- [ ] Modo sin conexión\n\n| Plan | Usuarios |\n| --- | ---: |\n| Free | 1 |\n| Pro | 8 |\n\n```js\nconst total = items.reduce((a, b) => a + b, 0);\n```\n\n> Todo se procesa en tu navegador.',
          '# Release notes 1.5\n\nWhat is new **this week**:\n\n- Export to CSV\n- Keyboard shortcuts\n- [x] Terminal theme\n- [ ] Offline mode\n\n| Plan | Seats |\n| --- | ---: |\n| Free | 1 |\n| Pro | 8 |\n\n```js\nconst total = items.reduce((a, b) => a + b, 0);\n```\n\n> Everything runs in your browser.',
        )[lang],
      );
    },
    // El resultado va debajo del editor: se baja hasta el campo para ver los dos.
    after: scrollTo('#markdown-input', 60),
  },
  curl: {
    theme: 'terminal',
    prep: async (page, lang) => {
      const [host, path, qty] = T(
        ['api.ejemplo.com', 'pedidos', 'cantidad'],
        ['api.example.com', 'orders', 'quantity'],
      )[lang];
      await fill(
        page,
        '#curl-input',
        `curl -X POST https://${host}/v1/${path} \\\n  -H 'Content-Type: application/json' \\\n  -H 'Accept: application/json' \\\n  -d '{"sku":"TEC-104","${qty}":2}'`,
      );
    },
  },
  'query-string': {
    theme: 'light',
    prep: async (page) => {
      await fill(
        page,
        '#query-string-input',
        '?q=portatil&precio[min]=500&precio[max]=1200&marca=acme&marca=nimbus&pagina=2',
      );
    },
  },

  // ---- Identificadores
  dni: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#dni-input', DNI);
    },
  },
  cif: {
    theme: 'dark',
    prep: async (page) => {
      await fill(page, '#cif-input', 'B65410011');
    },
  },
  iban: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#iban-input', 'ES91 2100 0418 4502 0005 1332');
    },
  },
  plate: {
    theme: 'terminal',
    prep: async (page) => {
      await fill(page, '#plate-input', 'M-1234-AB');
    },
  },
  nss: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#nss-input', '28/12345678/40');
    },
  },
  card: {
    theme: 'dark',
    prep: async (page) => {
      await tab(page, 1);
      await fill(page, '#card-seed', 'demo');
    },
  },
  phone: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#phone-input', '+34 612 34 56 78');
    },
  },
  bic: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#bic-input', 'CAIXESBBXXX');
    },
  },
  'ean-isbn': {
    theme: 'dark',
    prep: async (page) => {
      await fill(page, '#ean-isbn-input', '0306406152');
    },
  },
  'postal-code': {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#postal-code-input', '29015');
    },
  },

  // ---- Conversores
  timestamp: {
    theme: 'dark',
    prep: async (page) => {
      await fill(page, '#timestamp-input', '1767225600');
    },
  },
  color: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#color-hex', '#ff5419');
    },
  },
  'number-base': {
    theme: 'terminal',
    prep: async (page) => {
      await fill(page, '#number-base-dec', '48879');
    },
  },
  units: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#units-value', '42.195');
      await page.locator('#units-from').selectOption('km');
    },
  },
  currency: {
    theme: 'dark',
    prep: async (page) => {
      await fill(page, '#currency-amount', '250');
      await page.locator('#currency-from').selectOption('EUR');
      await page.locator('#currency-to').selectOption('USD');
    },
  },
  'px-rem': {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#px-rem-px', '24');
    },
  },
  chmod: {
    theme: 'terminal',
    prep: async (page) => {
      await fill(page, '#chmod-octal', '755');
    },
  },
  'file-size': {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#file-size-input', '1 TB');
    },
  },

  // ---- Calculadoras
  iva: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#iva-amount', '1250');
    },
  },
  irpf: {
    theme: 'dark',
    prep: async (page) => {
      await fill(page, '#irpf-amount', '2400');
      await page.locator('#irpf-vat').selectOption('21');
      await page.locator('#irpf-rate').selectOption('15');
    },
  },
  percent: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#percent-x', '21');
      await fill(page, '#percent-y', '1250');
    },
  },
  'rule-of-three': {
    theme: 'terminal',
    prep: async (page) => {
      await fill(page, '#rot-a', '3');
      await fill(page, '#rot-b', '450');
      await fill(page, '#rot-c', '8');
    },
  },
  workdays: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#workdays-start', '2026-12-01');
      await fill(page, '#workdays-end', '2026-12-31');
    },
  },

  // ---- Azar
  wheel: {
    theme: 'light',
    prep: async (page, lang) => {
      await fill(page, '#wheel-options', NAMES.slice(0, 6).join('\n'));
      await page.getByRole('button', { name: T('Girar', 'Spin')[lang], exact: true }).click();
    },
  },
  shuffle: {
    theme: 'dark',
    prep: async (page) => {
      await fill(page, '#shuffle-list', NAMES.slice(0, 8).join('\n'));
      await fill(page, '#shuffle-seed', 'demo');
    },
  },
  teams: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#teams-people', NAMES.join('\n'));
      await fill(page, '#teams-seed', 'demo');
    },
  },
  dice: {
    theme: 'terminal',
    prep: async (page, lang) => {
      await fill(page, '#dice-notation', '3d6+2');
      await fill(page, '#dice-seed', 'demo');
      await page.getByRole('button', { name: T('Lanzar', 'Roll')[lang], exact: true }).click();
    },
  },

  // ---- Referencia
  'http-status': {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#http-status-search', '40');
    },
  },
  cron: {
    theme: 'dark',
    prep: async (page) => {
      await page.locator('#cron-zone').selectOption('Europe/Madrid');
      await fill(page, '#cron-expr', '30 9 * * 1-5');
    },
  },
  'user-agent': {
    theme: 'light',
    prep: async (page) => {
      await fill(
        page,
        '#user-agent-input',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
      );
    },
  },
  semver: {
    theme: 'terminal',
    prep: async (page) => {
      await fill(page, '#semver-range', '^1.2.3');
      await fill(page, '#semver-versions', '1.2.3\n1.4.0\n1.9.2\n2.0.0\n1.2.0\n2.1.0-beta.1');
    },
  },
  cidr: {
    theme: 'light',
    prep: async (page) => {
      await fill(page, '#cidr-input', '192.168.1.10/24');
    },
  },
};

// Portada: la home con recientes y favoritos, como la vería alguien que ya la usa.
const HOME_STORAGE = {
  recent: JSON.stringify(['json', 'jwt', 'regex', 'uuid', 'iban', 'cron']),
  favorites: JSON.stringify(['json', 'regex', 'iva']),
};

export function buildScenes(tools) {
  const ids = new Set(tools.map((t) => t.id));
  const sobran = Object.keys(PER_TOOL).filter((id) => !ids.has(id));
  const faltan = tools.filter((t) => !PER_TOOL[t.id]).map((t) => t.id);
  if (sobran.length || faltan.length) {
    throw new Error(
      `scenes.mjs no casa con el sitio: faltan [${faltan.join(', ')}], sobran [${sobran.join(', ')}]`,
    );
  }

  const home = { es: '/es', en: '/en' };
  const covers = [
    { file: 'cover', path: home, theme: 'light', storage: HOME_STORAGE },
    { file: 'cover-mobile', path: home, theme: 'light', storage: HOME_STORAGE, mobile: true },
  ];
  const toolScenes = tools.map((tool, i) => ({
    file: `tool-${String(i + 1).padStart(2, '0')}-${tool.id}`,
    tool,
    path: tool.path,
    ...PER_TOOL[tool.id],
  }));
  return [...covers, ...toolScenes];
}

export { DNI, JWT };
