import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'card',
  category: 'ids',
  icon: 'credit-card',
  slug: { es: 'tarjetas-de-credito-de-prueba', en: 'test-credit-card-numbers' },
  name: { es: 'Tarjetas de prueba', en: 'Test cards' },
  title: {
    es: 'Números de tarjeta de prueba y validador Luhn',
    en: 'Test credit card numbers and Luhn validator',
  },
  heading: {
    es: 'Números de tarjeta de prueba',
    en: 'Test credit card numbers',
  },
  description: {
    es: 'Genera números de tarjeta Visa, Mastercard y American Express que pasan Luhn para entornos de prueba, y valida cualquier número: marca y dígito de control.',
    en: 'Generate Visa, Mastercard and American Express numbers that pass Luhn for test environments, and validate any card number: brand and check digit.',
  },
  keywords: {
    es: [
      'tarjeta de prueba',
      'numero tarjeta credito prueba',
      'algoritmo luhn',
      'validar tarjeta',
      'tarjeta visa prueba',
    ],
    en: [
      'test credit card numbers',
      'luhn validator',
      'fake credit card for testing',
      'validate card number',
      'stripe test card',
    ],
  },
  tabs: { es: ['Validar', 'Generar'], en: ['Validate', 'Generate'] },
  rememberInput: false,
  faq: {
    es: [
      {
        q: '¿Sirven para pagar?',
        a: 'No. Son números al azar que cumplen el formato de la marca y el algoritmo de Luhn, sin cuenta, titular ni CVV reales detrás. Una pasarela de pago real los rechaza.',
      },
      {
        q: '¿Qué es el algoritmo de Luhn?',
        a: 'Una suma de control que detecta casi cualquier errata al teclear un número de tarjeta. No dice nada de si la tarjeta existe o tiene saldo.',
      },
    ],
    en: [
      {
        q: 'Can they be used to pay?',
        a: 'No. They are random numbers that follow the brand format and the Luhn algorithm, with no real account, holder or CVV behind them. A real payment gateway rejects them.',
      },
      {
        q: 'What is the Luhn algorithm?',
        a: 'A checksum that catches almost any typo in a card number. It says nothing about whether the card exists or has funds.',
      },
    ],
  },
};
