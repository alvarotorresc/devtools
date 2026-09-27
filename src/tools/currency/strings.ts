import type { Locale } from '../types';

export const strings = {
  es: {
    amount: 'Importe',
    from: 'De',
    to: 'A',
    result: 'Conversión',
    all: 'En todas las divisas',
    loading: 'Descargando los tipos del BCE…',
    ok: 'Tipos del BCE del {date}',
    offline: 'Sin conexión: se usan los tipos guardados del {date}',
    error:
      'No se han podido descargar los tipos de cambio y no hay ninguno guardado. Comprueba la conexión y pulsa Reintentar.',
    retry: 'Reintentar',
    invalid: 'Escribe un número, por ejemplo 1234,5.',
    missing: 'La divisa {c} ya no viene en la tabla del BCE: se ha cambiado a EUR.',
    unit: '1 {a} = {r} {b}',
    privacy:
      'Los tipos son de referencia, públicos, del Banco Central Europeo, y se descargan de api.frankfurter.dev. La herramienta no envía ningún dato tuyo: el importe y las divisas se calculan en tu navegador.',
    copyIn: 'Copiar en {c}',
  },
  en: {
    amount: 'Amount',
    from: 'From',
    to: 'To',
    result: 'Conversion',
    all: 'In every currency',
    loading: 'Downloading ECB rates…',
    ok: 'ECB rates of {date}',
    offline: 'Offline: using the rates saved on {date}',
    error:
      'The exchange rates could not be downloaded and none are saved. Check your connection and press Retry.',
    retry: 'Retry',
    invalid: 'Type a number, for example 1234.5.',
    missing: 'The ECB table no longer includes {c}: it was changed to EUR.',
    unit: '1 {a} = {r} {b}',
    privacy:
      'These are public reference rates from the European Central Bank, downloaded from api.frankfurter.dev. The tool sends none of your data: the amount and the currencies are computed in your browser.',
    copyIn: 'Copy in {c}',
  },
} satisfies Record<Locale, Record<string, string>>;
