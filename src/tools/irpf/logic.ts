import { roundCents } from '../../lib/numbers';

/** Withholding for self-employed invoices (Ley 35/2006 and RD 439/2007), as of 2026-09. */
export const IRPF_RATES = [15, 7, 19] as const;
export const VAT_RATES = [21, 10, 4, 0] as const;

export type IrpfDirection = 'base' | 'net';

export interface Invoice {
  base: number;
  vat: number;
  irpf: number;
  /** What the client pays: base + VAT − withholding. */
  net: number;
}

const cents = (n: number) => Math.round(n * 100);

/** Rates are percentages: 21 and 15, not 0.21 and 0.15. VAT and IRPF are rounded separately. */
export function invoiceFromBase(base: number, vatRate: number, irpfRate: number): Invoice {
  const b = roundCents(base);
  const vat = roundCents((b * vatRate) / 100);
  const irpf = roundCents((b * irpfRate) / 100);
  return { base: b, vat, irpf, net: roundCents(b + vat - irpf) };
}

export type FromNet =
  { ok: true; invoice: Invoice; exact: boolean } | { ok: false; reason: 'rates' };

/**
 * Finds the base for a net amount. Each cent of base moves the net by 0, 1 or 2 cents, so some
 * nets cannot be reached (1.03 € at 21 % / 15 %). The 5 bases around the estimate are tried: an
 * exact one wins; otherwise the closest, and on a tie the smallest base.
 */
export function invoiceFromNet(net: number, vatRate: number, irpfRate: number): FromNet {
  const factor = 1 + vatRate / 100 - irpfRate / 100;
  if (factor <= 0) return { ok: false, reason: 'rates' };
  const target = cents(net);
  const b0 = cents(roundCents(net / factor));
  let best: Invoice | null = null;
  for (let c = b0 - 2; c <= b0 + 2; c++) {
    const inv = invoiceFromBase(c / 100, vatRate, irpfRate);
    if (!best || Math.abs(cents(inv.net) - target) < Math.abs(cents(best.net) - target)) {
      best = inv;
    }
  }
  return { ok: true, invoice: best!, exact: cents(best!.net) === target };
}
