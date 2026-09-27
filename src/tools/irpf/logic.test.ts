import { describe, expect, it } from 'vitest';
import { invoiceFromBase, invoiceFromNet } from './logic';

describe('invoiceFromBase', () => {
  it('adds VAT and subtracts the withholding', () => {
    expect(invoiceFromBase(1000, 21, 15)).toEqual({ base: 1000, vat: 210, irpf: 150, net: 1060 });
    expect(invoiceFromBase(1000, 21, 7)).toEqual({ base: 1000, vat: 210, irpf: 70, net: 1140 });
  });

  it('works without withholding, without VAT, and without both', () => {
    expect(invoiceFromBase(1000, 21, 0)).toEqual({ base: 1000, vat: 210, irpf: 0, net: 1210 });
    expect(invoiceFromBase(1000, 0, 15)).toEqual({ base: 1000, vat: 0, irpf: 150, net: 850 });
    expect(invoiceFromBase(1000, 0, 0)).toEqual({ base: 1000, vat: 0, irpf: 0, net: 1000 });
  });

  it('rounds VAT and IRPF separately', () => {
    expect(invoiceFromBase(0.97, 21, 15)).toEqual({ base: 0.97, vat: 0.2, irpf: 0.15, net: 1.02 });
  });
});

describe('invoiceFromNet', () => {
  it('finds the exact base when there is one', () => {
    expect(invoiceFromNet(1060, 21, 15)).toEqual({
      ok: true,
      exact: true,
      invoice: { base: 1000, vat: 210, irpf: 150, net: 1060 },
    });
    expect(invoiceFromNet(850, 0, 15)).toMatchObject({ exact: true, invoice: { base: 1000 } });
  });

  it('round-trips every base from 0.01 € to 50 €', () => {
    for (let c = 1; c <= 5000; c++) {
      const inv = invoiceFromBase(c / 100, 21, 15);
      const back = invoiceFromNet(inv.net, 21, 15);
      expect(back.ok && back.exact && back.invoice.net).toBe(inv.net);
    }
  });

  it('picks the closest base, the smallest on a tie, when no base is exact', () => {
    // 0.96 and 0.97 give 1.02; 0.98 gives 1.04. All are 1 cent away: 0.96 wins.
    expect(invoiceFromNet(1.03, 21, 15)).toEqual({
      ok: true,
      exact: false,
      invoice: { base: 0.96, vat: 0.2, irpf: 0.14, net: 1.02 },
    });
  });

  it('handles a net of 0', () => {
    expect(invoiceFromNet(0, 21, 15)).toEqual({
      ok: true,
      exact: true,
      invoice: { base: 0, vat: 0, irpf: 0, net: 0 },
    });
  });

  it('refuses rates that make the base impossible', () => {
    expect(invoiceFromNet(100, 0, 100)).toEqual({ ok: false, reason: 'rates' });
  });
});
