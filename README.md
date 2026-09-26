# devtools

> Herramientas para desarrolladores que funcionan en tu navegador · Developer tools that run in your browser.

[![CI](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml/badge.svg)](https://github.com/alvarotorresc/devtools/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-live-success)](https://devtools.alvarotc.com)

Sitio estático bilingüe (ES/EN) hecho con Astro 7 y Svelte 5. Nada de lo que pegas sale de tu equipo.

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

Terminal (por defecto), oscuro (grafito) y claro (aluminio). Los tokens están en `src/styles/tokens.css`.
