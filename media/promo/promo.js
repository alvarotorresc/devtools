// Rellena los textos de la promo según ?lang= y pone la captura de ?img=. El número de
// herramientas llega en ?n= (lo calcula promo.mjs a partir del sitio construido).
const params = new URLSearchParams(location.search);
const lang = params.get('lang') === 'en' ? 'en' : 'es';
const n = params.get('n') ?? '';

const TEXT = {
  es: {
    taglineShort: 'Herramientas que se ejecutan en tu navegador.',
    count: `${n} herramientas`,
    sent: '0 B enviados',
    url: 'devtools.alvarotc.com/es',
    bullets: ['JSON, JWT, regex, hashes', 'DNI, IBAN, IVA e IRPF', 'Sin cuentas · Sin servidor'],
  },
  en: {
    taglineShort: 'Tools that run in your browser.',
    count: `${n} tools`,
    sent: '0 B sent',
    url: 'devtools.alvarotc.com/en',
    bullets: ['JSON, JWT, regex, hashes', 'Spanish IDs, IBAN, VAT', 'No accounts · No server'],
  },
}[lang];

document.documentElement.lang = lang;
for (const el of document.querySelectorAll('[data-t]')) el.textContent = TEXT[el.dataset.t];
const list = document.querySelector('[data-bullets]');
if (list) {
  for (const b of TEXT.bullets) {
    const li = document.createElement('li');
    li.textContent = b;
    list.appendChild(li);
  }
}
const img = params.get('img');
if (img) document.getElementById('shot').src = img;
