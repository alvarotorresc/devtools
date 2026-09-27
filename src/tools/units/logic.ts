export type Quantity = 'length' | 'mass' | 'temperature' | 'volume' | 'area' | 'speed' | 'data';

/** Same order as `meta.tabs`. */
export const QUANTITIES: Quantity[] = [
  'length',
  'mass',
  'temperature',
  'volume',
  'area',
  'speed',
  'data',
];

export interface Unit {
  id: string;
  symbol: string;
  /** How many base units (m, kg, l, m², m/s or bit) one of this unit is. Exact by definition. */
  factor: number;
}

type Scaled = Exclude<Quantity, 'temperature'>;

export const UNITS: Record<Scaled, Unit[]> = {
  length: [
    { id: 'um', symbol: 'µm', factor: 1e-6 },
    { id: 'mm', symbol: 'mm', factor: 0.001 },
    { id: 'cm', symbol: 'cm', factor: 0.01 },
    { id: 'm', symbol: 'm', factor: 1 },
    { id: 'km', symbol: 'km', factor: 1000 },
    { id: 'in', symbol: 'in', factor: 0.0254 },
    { id: 'ft', symbol: 'ft', factor: 0.3048 },
    { id: 'yd', symbol: 'yd', factor: 0.9144 },
    { id: 'mi', symbol: 'mi', factor: 1609.344 },
    { id: 'nmi', symbol: 'nmi', factor: 1852 },
  ],
  mass: [
    { id: 'mg', symbol: 'mg', factor: 1e-6 },
    { id: 'g', symbol: 'g', factor: 0.001 },
    { id: 'kg', symbol: 'kg', factor: 1 },
    { id: 't', symbol: 't', factor: 1000 },
    { id: 'oz', symbol: 'oz', factor: 0.028349523125 },
    { id: 'lb', symbol: 'lb', factor: 0.45359237 },
    { id: 'st', symbol: 'st', factor: 6.35029318 },
  ],
  volume: [
    { id: 'ml', symbol: 'ml', factor: 0.001 },
    { id: 'cm3', symbol: 'cm³', factor: 0.001 },
    { id: 'cl', symbol: 'cl', factor: 0.01 },
    { id: 'dl', symbol: 'dl', factor: 0.1 },
    { id: 'l', symbol: 'l', factor: 1 },
    { id: 'm3', symbol: 'm³', factor: 1000 },
    { id: 'tsp', symbol: 'tsp', factor: 0.00492892159375 },
    { id: 'tbsp', symbol: 'tbsp', factor: 0.01478676478125 },
    { id: 'floz', symbol: 'fl oz', factor: 0.0295735295625 },
    { id: 'cup', symbol: 'cup', factor: 0.2365882365 },
    { id: 'pt', symbol: 'pt', factor: 0.473176473 },
    { id: 'qt', symbol: 'qt', factor: 0.946352946 },
    { id: 'gal', symbol: 'gal', factor: 3.785411784 },
    { id: 'flozuk', symbol: 'fl oz UK', factor: 0.0284130625 },
    { id: 'ptuk', symbol: 'pt UK', factor: 0.56826125 },
    { id: 'galuk', symbol: 'gal UK', factor: 4.54609 },
  ],
  area: [
    { id: 'mm2', symbol: 'mm²', factor: 1e-6 },
    { id: 'cm2', symbol: 'cm²', factor: 1e-4 },
    { id: 'm2', symbol: 'm²', factor: 1 },
    { id: 'ha', symbol: 'ha', factor: 1e4 },
    { id: 'km2', symbol: 'km²', factor: 1e6 },
    { id: 'in2', symbol: 'in²', factor: 0.00064516 },
    { id: 'ft2', symbol: 'ft²', factor: 0.09290304 },
    { id: 'yd2', symbol: 'yd²', factor: 0.83612736 },
    { id: 'ac', symbol: 'ac', factor: 4046.8564224 },
    { id: 'mi2', symbol: 'mi²', factor: 2589988.110336 },
  ],
  speed: [
    { id: 'mps', symbol: 'm/s', factor: 1 },
    { id: 'kmh', symbol: 'km/h', factor: 1 / 3.6 },
    { id: 'mph', symbol: 'mph', factor: 0.44704 },
    { id: 'kn', symbol: 'kn', factor: 1852 / 3600 },
    { id: 'fps', symbol: 'ft/s', factor: 0.3048 },
  ],
  data: [
    { id: 'bit', symbol: 'bit', factor: 1 },
    { id: 'kbit', symbol: 'kbit', factor: 1e3 },
    { id: 'Mbit', symbol: 'Mbit', factor: 1e6 },
    { id: 'Gbit', symbol: 'Gbit', factor: 1e9 },
    { id: 'B', symbol: 'B', factor: 8 },
    { id: 'kB', symbol: 'kB', factor: 8e3 },
    { id: 'MB', symbol: 'MB', factor: 8e6 },
    { id: 'GB', symbol: 'GB', factor: 8e9 },
    { id: 'TB', symbol: 'TB', factor: 8e12 },
    { id: 'KiB', symbol: 'KiB', factor: 8 * 2 ** 10 },
    { id: 'MiB', symbol: 'MiB', factor: 8 * 2 ** 20 },
    { id: 'GiB', symbol: 'GiB', factor: 8 * 2 ** 30 },
    { id: 'TiB', symbol: 'TiB', factor: 8 * 2 ** 40 },
  ],
};

export type TemperatureId = 'C' | 'F' | 'K';

export const TEMPERATURE_UNITS: Unit[] = [
  { id: 'C', symbol: '°C', factor: 1 },
  { id: 'F', symbol: '°F', factor: 1 },
  { id: 'K', symbol: 'K', factor: 1 },
];

export const DEFAULT_UNIT: Record<Quantity, string> = {
  length: 'm',
  mass: 'kg',
  temperature: 'C',
  volume: 'l',
  area: 'm2',
  speed: 'kmh',
  data: 'MB',
};

export function unitsOf(q: Quantity): Unit[] {
  return q === 'temperature' ? TEMPERATURE_UNITS : UNITS[q];
}

/**
 * Removes floating-point noise: 0.3048 / 0.0254 = 12.000000000000002 → 12.
 * 15 significant digits (not 12): 12 corrupted exact integer conversions with 13+
 * significant digits, e.g. 1 TiB in bytes (1099511627776) rounded to 1099511627780.
 */
export function clean(x: number): number {
  return Number(x.toPrecision(15));
}

export function convertFactor(value: number, from: Unit, to: Unit): number {
  return clean((value * from.factor) / to.factor);
}

const TO_C: Record<TemperatureId, (v: number) => number> = {
  C: (v) => v,
  F: (v) => ((v - 32) * 5) / 9,
  K: (v) => v - 273.15,
};

const FROM_C: Record<TemperatureId, (v: number) => number> = {
  C: (v) => v,
  F: (v) => (v * 9) / 5 + 32,
  K: (v) => v + 273.15,
};

export const ABSOLUTE_ZERO_C = -273.15;

/** Temperatures are affine, not proportional: they go through °C. */
export function convertTemperature(value: number, from: TemperatureId, to: TemperatureId): number {
  // toFixed(10) first: −459.67 °F would otherwise give −2.8e-14 K instead of 0.
  return clean(Number(FROM_C[to](TO_C[from](value)).toFixed(10)));
}

export type ConvertResult =
  | { ok: true; rows: { unit: Unit; value: number }[] }
  | { ok: false; reason: 'negative' | 'belowAbsoluteZero' | 'unknownUnit' };

/** The value in every unit of the tab, in the table's order. */
export function convertAll(q: Quantity, value: number, fromId: string): ConvertResult {
  const units = unitsOf(q);
  const from = units.find((u) => u.id === fromId);
  if (!from) return { ok: false, reason: 'unknownUnit' };
  if (q === 'temperature') {
    const id = from.id as TemperatureId;
    if (convertTemperature(value, id, 'C') < ABSOLUTE_ZERO_C) {
      return { ok: false, reason: 'belowAbsoluteZero' };
    }
    return {
      ok: true,
      rows: units.map((u) => ({
        unit: u,
        value: convertTemperature(value, id, u.id as TemperatureId),
      })),
    };
  }
  if (value < 0) return { ok: false, reason: 'negative' };
  return { ok: true, rows: units.map((u) => ({ unit: u, value: convertFactor(value, from, u) })) };
}
