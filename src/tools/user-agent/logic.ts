import UAParser from 'ua-parser-js';

export type DeviceType =
  'console' | 'mobile' | 'smarttv' | 'tablet' | 'wearable' | 'embedded' | 'desktop';

export interface UaInfo {
  browser: string | null;
  engine: string | null;
  os: string | null;
  vendor: string | null;
  model: string | null;
  /** 'desktop' when the parser found no device type: most desktop browsers do not say it. */
  deviceType: DeviceType;
  /** False when the device type is only a guess (no type in the User-Agent). */
  deviceKnown: boolean;
  cpu: string | null;
  bot: boolean;
  /** False when not even a browser, engine or OS was recognised. */
  recognised: boolean;
}

export interface Brand {
  brand: string;
  version: string;
}

const BOT = /bot|crawler|spider|crawling|slurp|mediapartners/i;
const DEVICE_TYPES = ['console', 'mobile', 'smarttv', 'tablet', 'wearable', 'embedded'];

function join(...parts: (string | undefined)[]): string | null {
  const s = parts.filter(Boolean).join(' ');
  return s || null;
}

/** Returns null for an empty input: in a browser, ua-parser-js would parse the browser's own UA. */
export function parseUserAgent(ua: string): UaInfo | null {
  const text = ua.trim();
  if (!text) return null;
  const r = new UAParser(text).getResult();
  const type = r.device.type;
  const known = !!type && DEVICE_TYPES.includes(type);
  const info: UaInfo = {
    browser: join(r.browser.name, r.browser.version),
    engine: join(r.engine.name, r.engine.version),
    os: join(r.os.name, r.os.version),
    vendor: r.device.vendor ?? null,
    model: r.device.model ?? null,
    deviceType: known ? (type as DeviceType) : 'desktop',
    deviceKnown: known,
    cpu: r.cpu.architecture ?? null,
    bot: BOT.test(text),
    recognised: false,
  };
  info.recognised = !!(info.browser || info.engine || info.os);
  return info;
}

/** Client Hints brands without the random "Not A Brand" entries browsers add on purpose. */
export function formatBrands(brands: readonly Brand[]): string {
  return brands
    .filter((b) => !/not.?a.?brand/i.test(b.brand))
    .map((b) => `${b.brand} ${b.version}`)
    .join(', ');
}
