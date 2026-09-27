import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'semver',
  category: 'ref',
  icon: 'tag',
  slug: { es: 'comprobar-rango-semver', en: 'semver-range-checker' },
  name: { es: 'Semver', en: 'Semver' },
  title: {
    es: 'Comprobar versiones semver contra un rango (^, ~)',
    en: 'Semver range checker: does a version satisfy ^ or ~',
  },
  description: {
    es: 'Comprueba qué versiones cumplen un rango semver de npm (^, ~, x, guiones y ||), con el rango explicado en palabras y la versión más alta que encaja.',
    en: 'Check which versions satisfy an npm semver range (^, ~, x, hyphens and ||), with the range explained in words and the highest matching version.',
  },
  keywords: {
    es: ['semver', 'rango semver', 'caret', 'tilde', 'versiones npm', 'package.json'],
    en: ['semver', 'semver range', 'semver checker', 'caret range', 'tilde range', 'npm version'],
  },
  faq: {
    es: [
      {
        q: '¿Qué diferencia hay entre ^ y ~?',
        a: '^1.2.3 acepta cualquier versión 1.x.y desde la 1.2.3, porque no cambia la mayor. ~1.2.3 solo acepta parches: de 1.2.3 hasta antes de 1.3.0. Con versiones 0.x, ^ es más estricto: ^0.2.3 no pasa de 0.3.0.',
      },
      {
        q: '¿Por qué 2.0.0-beta no cumple ^1.2.3?',
        a: 'npm no deja entrar prereleases en un rango salvo que el propio rango tenga una prerelease de esa misma versión. Activa «Incluir prereleases» para comprobarlas igualmente.',
      },
    ],
    en: [
      {
        q: 'What is the difference between ^ and ~?',
        a: '^1.2.3 accepts any 1.x.y version from 1.2.3, because the major does not change. ~1.2.3 only accepts patches: from 1.2.3 up to but not including 1.3.0. With 0.x versions ^ is stricter: ^0.2.3 stops before 0.3.0.',
      },
      {
        q: 'Why does 2.0.0-beta not satisfy ^1.2.3?',
        a: 'npm keeps prereleases out of a range unless the range itself names a prerelease of that same version. Turn on “Include prereleases” to check them anyway.',
      },
    ],
  },
};
