# DevTools

> Developer utilities for everyday coding tasks.

[![CI](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml/badge.svg)](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Qué es

A collection of 14 client-side developer tools in a single app. No backend, no tracking, everything runs in your browser. Built for speed and simplicity.

## Herramientas incluidas

| Tool | Description |
|------|-------------|
| UUID | Generate and validate UUIDs (v4) |
| JSON | Format, minify, and validate JSON |
| Base64 | Encode and decode Base64 (UTF-8 safe) |
| JWT | Decode JSON Web Tokens |
| Hash | Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes |
| URL Encode | Encode and decode URL components |
| Regex | Test regular expressions with live matching |
| Timestamp | Convert between Unix timestamps and dates |
| Color | Convert between HEX, RGB, and HSL |
| Diff | Compare two texts side by side |
| Lorem Ipsum | Generate placeholder text |
| HTML Entities | Encode and decode HTML entities |
| Text | Case conversion, word count, sort, dedupe |
| Number Base | Convert between binary, octal, decimal, hex |

## Tech Stack

- Vite + TypeScript (vanilla, zero runtime dependencies)
- Hosting: Netlify

## Desarrollo local

### Requisitos previos

- Node.js >= 20
- pnpm

### Instalación

```bash
pnpm install
pnpm dev
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm preview` | Preview del build |
| `pnpm test` | Ejecutar tests |
| `pnpm lint` | Linter + format check |
| `pnpm format` | Auto-format con Prettier |

## Licencia

MIT — ver [LICENSE](./LICENSE)
