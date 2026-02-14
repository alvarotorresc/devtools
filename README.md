# DevTools

> Developer utilities for everyday coding tasks.

[![CI](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml/badge.svg)](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-live-success)](https://devtools.alvarotc.com)

## Qué es

A collection of 14 client-side developer tools in a single app. No backend, no tracking, everything runs in your browser. Built for speed and simplicity.

## Features

### UUID Generator

Generate random UUID v4 identifiers with one click. Validate existing UUIDs, toggle dashes on/off, switch between uppercase and lowercase, and bulk-generate up to 100 UUIDs at once. Copy to clipboard instantly.

### JSON Formatter

Paste raw JSON and format it with proper indentation for readability, or minify it to a single line for transport. Includes validation that reports exact parse errors so you can spot the broken comma or missing bracket.

### Base64 Encoder/Decoder

Convert any text to Base64 and back. Handles UTF-8 characters correctly (emojis, accents, special symbols) using the modern TextEncoder/TextDecoder API instead of the legacy `btoa`/`atob` limitations.

### JWT Decoder

Paste a JSON Web Token and instantly see its decoded header (algorithm, type) and payload (claims, user data). Shows expiration status with a human-readable time difference — whether the token is still valid or how long ago it expired.

### Hash Generator

Enter any text and generate its cryptographic hash in four algorithms simultaneously: SHA-1, SHA-256, SHA-384, and SHA-512. Uses the native Web Crypto API for fast, secure hashing. Each hash has its own copy button.

### URL Encoder/Decoder

Encode special characters in URLs using `encodeURIComponent` or decode percent-encoded strings back to readable text. Useful for debugging query parameters, building API requests, or decoding URLs copied from browser address bars.

### Regex Tester

Write a regular expression and test it against any input text in real time. Matches are highlighted inline as you type. Shows a match list with count and individual values. Supports all standard flags (global, case-insensitive, multiline).

### Timestamp Converter

A live clock showing the current Unix timestamp. Convert any Unix timestamp (seconds or milliseconds) to a human-readable date in UTC, ISO 8601, and local format. Or go the other way: paste a date string and get its Unix timestamp.

### Color Converter

Enter a color in any format — HEX, RGB, or HSL — and see all three representations update live. Includes a color preview swatch. Useful for converting between formats when working with CSS, design tokens, or theme systems.

### Text Diff

Paste two versions of a text and compare them side by side. Uses a longest-common-subsequence (LCS) algorithm to compute a proper diff. Added lines show in green, removed lines in red, and unchanged lines in gray.

### Lorem Ipsum Generator

Generate placeholder text by words, sentences, or paragraphs. Choose the quantity you need and copy the result. Useful for filling UI mockups, testing layouts, or populating database seeds.

### HTML Entities Encoder/Decoder

Convert special characters (`<`, `>`, `&`, `"`, `'`) to their HTML entity equivalents and back. Essential when embedding user content in HTML, building email templates, or debugging escaped markup.

### Text Utilities

A Swiss Army knife for text manipulation. Includes:
- **Stats**: live character, word, line, and byte count
- **Case conversion**: UPPER, lower, Title Case, camelCase, snake_case, kebab-case
- **Transforms**: sort lines, reverse text, remove duplicates, trim whitespace, remove empty lines

### Number Base Converter

Enter a number in decimal, binary, octal, or hexadecimal and see it converted to all four bases instantly. Useful for low-level programming, debugging bitfields, reading hex dumps, or working with permissions.

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
