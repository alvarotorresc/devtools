import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'irpf',
  category: 'calc',
  icon: 'receipt-text',
  slug: { es: 'calculadora-retencion-irpf', en: 'spanish-irpf-withholding-calculator' },
  name: { es: 'Retención IRPF', en: 'IRPF withholding' },
  title: {
    es: 'Calculadora de retención de IRPF para facturas',
    en: 'Spanish IRPF withholding calculator for invoices',
  },
  heading: {
    es: 'Calculadora de retención de IRPF',
    en: 'Spanish IRPF withholding calculator',
  },
  description: {
    es: 'Calcula una factura de autónomo con IVA y retención de IRPF (15, 7 o 19 %) desde la base o desde lo que quieres cobrar, con el desglose completo.',
    en: 'Work out a Spanish freelance invoice with VAT and IRPF withholding (15, 7 or 19%) from the base or from what you want to be paid, fully broken down.',
  },
  keywords: {
    es: [
      'retención irpf',
      'factura autónomo',
      'irpf 15',
      'irpf 7',
      'calcular factura',
      'líquido a cobrar',
    ],
    en: [
      'irpf withholding',
      'spanish freelance invoice',
      'irpf 15',
      'autonomo invoice',
      'invoice calculator',
    ],
  },
  faq: {
    es: [
      {
        q: '¿Cuándo se aplica el 7 %?',
        a: 'Los profesionales que empiezan su actividad pueden aplicar el 7 % el año de alta y los dos siguientes, siempre que no hayan ejercido una actividad profesional en el año anterior al inicio.',
      },
      {
        q: '¿Quién paga la retención?',
        a: 'Tu cliente te paga el total menos la retención y la ingresa él en Hacienda, a cuenta de tu IRPF. En tu declaración de la renta se descuenta lo que ya te han retenido.',
      },
    ],
    en: [
      {
        q: 'When does the 7% rate apply?',
        a: 'Professionals starting their activity can apply 7% in the year they register and the next two, as long as they did not work as a professional in the year before starting.',
      },
      {
        q: 'Who pays the withholding?',
        a: 'Your client pays you the total minus the withholding and pays that part to the Spanish Tax Agency on account of your income tax. It is deducted in your annual return.',
      },
    ],
  },
  rememberInput: true,
  related: ['iva', 'percent', 'workdays'],
};
