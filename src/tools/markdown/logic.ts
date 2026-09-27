import { marked } from 'marked';

/** Above this size the preview waits for a pause in typing. */
export const DEBOUNCE_MS = 150;

export const SAMPLE = `# Título

Texto con **negrita**, *cursiva*, \`código\` y un [enlace](https://example.com).

- [x] Tarea hecha
- [ ] Tarea pendiente

| Columna | Valor |
|---|---:|
| a | 1 |
`;

/**
 * GitHub-flavoured Markdown to HTML. The result is NOT sanitised: it must go through
 * `sanitize()` (sanitize.ts) before it is ever put in the page.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { gfm: true, breaks: false, async: false }) as string;
}
