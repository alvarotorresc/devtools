import { describe, expect, it } from 'vitest';
import { categories } from './categories';
import { ICON_NAMES } from './icon-names';
import {
  categoryById,
  toolById,
  toolBySlug,
  tools,
  toolsInCategory,
  visibleCategories,
} from './registry';
import { LOCALES } from './types';

const contents = import.meta.glob('./*/content.*.md', { query: '?raw', eager: true });

describe('registry', () => {
  it('is not empty', () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it('has unique ids', () => {
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(LOCALES)('has unique, url-safe slugs in %s', (l) => {
    const slugs = tools.map((t) => t.slug[l]);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(LOCALES)('has unique titles and headings in %s', (l) => {
    const titles = tools.map((t) => t.title[l]);
    expect(new Set(titles).size).toBe(titles.length);
    const headings = tools.map((t) => t.heading[l]);
    expect(new Set(headings).size).toBe(headings.length);
  });

  it('gives every tool complete metadata in both languages', () => {
    for (const tool of tools) {
      expect(categories.map((c) => c.id)).toContain(tool.category);
      expect(ICON_NAMES).toContain(tool.icon);
      for (const l of LOCALES) {
        expect(tool.name[l], `${tool.id}.name.${l}`).toBeTruthy();
        expect(tool.title[l].length, `${tool.id}.title.${l}`).toBeLessThanOrEqual(49);
        expect(tool.heading[l], `${tool.id}.heading.${l}`).toBeTruthy();
        expect(tool.heading[l].length, `${tool.id}.heading.${l}`).toBeLessThanOrEqual(40);
        expect(tool.description[l].length, `${tool.id}.description.${l}`).toBeGreaterThanOrEqual(
          120,
        );
        expect(tool.description[l].length, `${tool.id}.description.${l}`).toBeLessThanOrEqual(155);
        expect(tool.keywords[l].length, `${tool.id}.keywords.${l}`).toBeGreaterThan(0);
        if (tool.tabs) expect(tool.tabs[l].length).toBe(tool.tabs.es.length);
      }
    }
  });

  it('has SEO content in both languages for every tool', () => {
    for (const tool of tools) {
      for (const l of LOCALES) {
        expect(Object.keys(contents), `${tool.id} content.${l}.md`).toContain(
          `./${tool.id}/content.${l}.md`,
        );
      }
    }
  });

  it('looks tools up by id and slug', () => {
    for (const tool of tools) {
      expect(toolById(tool.id)).toBe(tool);
      expect(toolBySlug('es', tool.slug.es)).toBe(tool);
      expect(toolBySlug('en', tool.slug.en)).toBe(tool);
    }
    expect(toolById('nope')).toBeUndefined();
  });

  it('only shows categories that have tools', () => {
    for (const c of visibleCategories()) expect(toolsInCategory(c.id).length).toBeGreaterThan(0);
  });
});

describe('categories', () => {
  it.each(LOCALES)('have unique, url-safe slugs in %s that no tool uses', (l) => {
    const slugs = categories.map((c) => c.slug[l]);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) {
      expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(toolBySlug(l, s), `${l}/${s} is also a tool`).toBeUndefined();
    }
  });

  it.each(LOCALES)('have unique titles and headings in %s that no tool uses', (l) => {
    const titles = [...categories.map((c) => c.title[l]), ...tools.map((t) => t.title[l])];
    expect(new Set(titles).size).toBe(titles.length);
    const headings = [...categories.map((c) => c.heading[l]), ...tools.map((t) => t.heading[l])];
    expect(new Set(headings).size).toBe(headings.length);
  });

  it('have complete page copy in both languages', () => {
    for (const c of categories) {
      expect(categoryById(c.id)).toBe(c);
      for (const l of LOCALES) {
        expect(c.title[l].length, `${c.id}.title.${l}`).toBeLessThanOrEqual(49);
        expect(c.heading[l], `${c.id}.heading.${l}`).toBeTruthy();
        expect(c.seoDescription[l].length, `${c.id}.seoDescription.${l}`).toBeGreaterThanOrEqual(
          120,
        );
        expect(c.seoDescription[l].length, `${c.id}.seoDescription.${l}`).toBeLessThanOrEqual(155);
        expect(c.intro[l]).toHaveLength(2);
        for (const p of c.intro[l]) expect(p.length, `${c.id}.intro.${l}`).toBeGreaterThan(200);
      }
    }
  });

  it('never repeat a paragraph between categories', () => {
    const paragraphs = categories.flatMap((c) => [...c.intro.es, ...c.intro.en]);
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });
});
