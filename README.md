# devtools

> Herramientas para desarrolladores que funcionan en tu navegador · Developer tools that run in your browser.

[![CI](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml/badge.svg)](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-live-success)](https://devtools.alvarotc.com)

Sitio estático bilingüe (ES/EN) hecho con Astro 7 y Svelte 5. Nada de lo que pegas sale de tu equipo.

## Herramientas

Todas tienen versión en español (`/es/…`) y en inglés (`/en/…`).

| Categoría | Herramienta | Página |
|---|---|---|
| Generadores | UUID v4 y v7, ULID y NanoID | [/es/generador-uuid](https://devtools.alvarotc.com/es/generador-uuid) |
| Generadores | Lorem ipsum | [/es/generador-lorem-ipsum](https://devtools.alvarotc.com/es/generador-lorem-ipsum) |
| Generadores | Datos de prueba (JSON, CSV y SQL) | [/es/generador-datos-de-prueba](https://devtools.alvarotc.com/es/generador-datos-de-prueba) |
| Codificación | Base64 (texto y archivos) | [/es/codificar-decodificar-base64](https://devtools.alvarotc.com/es/codificar-decodificar-base64) |
| Codificación | URL (codificar y analizar) | [/es/codificar-decodificar-url](https://devtools.alvarotc.com/es/codificar-decodificar-url) |
| Codificación | Entidades HTML | [/es/codificar-entidades-html](https://devtools.alvarotc.com/es/codificar-entidades-html) |
| Codificación | JWT | [/es/decodificador-jwt](https://devtools.alvarotc.com/es/decodificador-jwt) |
| Codificación | Hash (MD5, SHA-1, SHA-256, SHA-384, SHA-512) | [/es/generador-hash-md5-sha256](https://devtools.alvarotc.com/es/generador-hash-md5-sha256) |
| Texto y datos | JSON | [/es/formateador-json](https://devtools.alvarotc.com/es/formateador-json) |
| Texto y datos | Comparar textos | [/es/comparar-textos](https://devtools.alvarotc.com/es/comparar-textos) |
| Texto y datos | Regex | [/es/probador-regex](https://devtools.alvarotc.com/es/probador-regex) |
| Texto y datos | Mayúsculas y líneas | [/es/convertir-mayusculas-minusculas](https://devtools.alvarotc.com/es/convertir-mayusculas-minusculas) |
| Identificadores | DNI y NIE | [/es/validador-dni-nie](https://devtools.alvarotc.com/es/validador-dni-nie) |
| Identificadores | CIF | [/es/validador-cif](https://devtools.alvarotc.com/es/validador-cif) |
| Identificadores | IBAN y CCC | [/es/validador-iban](https://devtools.alvarotc.com/es/validador-iban) |
| Identificadores | Matrículas | [/es/validador-matriculas](https://devtools.alvarotc.com/es/validador-matriculas) |
| Identificadores | Número de la Seguridad Social | [/es/validador-numero-seguridad-social](https://devtools.alvarotc.com/es/validador-numero-seguridad-social) |
| Identificadores | Tarjetas de prueba (Luhn) | [/es/tarjetas-de-credito-de-prueba](https://devtools.alvarotc.com/es/tarjetas-de-credito-de-prueba) |
| Identificadores | Teléfonos de España (E.164) | [/es/validador-telefonos-espana](https://devtools.alvarotc.com/es/validador-telefonos-espana) |
| Identificadores | SWIFT / BIC | [/es/validador-swift-bic](https://devtools.alvarotc.com/es/validador-swift-bic) |
| Identificadores | EAN-13 e ISBN | [/es/validador-ean-isbn](https://devtools.alvarotc.com/es/validador-ean-isbn) |
| Identificadores | Código postal → provincia | [/es/codigo-postal-provincia](https://devtools.alvarotc.com/es/codigo-postal-provincia) |
| Conversores | Timestamp Unix | [/es/conversor-timestamp-unix](https://devtools.alvarotc.com/es/conversor-timestamp-unix) |
| Conversores | Colores (HEX, RGB, HSL, OKLCH) | [/es/conversor-colores](https://devtools.alvarotc.com/es/conversor-colores) |
| Conversores | Bases numéricas | [/es/conversor-bases-numericas](https://devtools.alvarotc.com/es/conversor-bases-numericas) |

## Desarrollo

Requiere Node 22.12+ y pnpm 10.

    pnpm install
    pnpm dev          # http://localhost:4321
    pnpm test         # tests de lógica (Vitest)
    pnpm build && pnpm test:e2e   # tests de navegador (Playwright)
    pnpm lint && pnpm check

## Añadir una herramienta

1. Crea `src/tools/<id>/` con `meta.ts`, `logic.ts`, `logic.test.ts`, `strings.ts`, `<Nombre>.svelte`, `content.es.md` y `content.en.md`.
2. Añade la meta a `src/tools/registry.ts`.
3. Añade una línea a `src/components/ToolIsland.astro`.

`pnpm test` falla si falta algún texto, slug o contenido en alguno de los dos idiomas.

## Temas

Claro (aluminio, por defecto), oscuro (grafito) y terminal. Los tokens están en `src/styles/tokens.css`.
