import { describe, expect, it } from 'vitest';
import { categories } from './categories';
import { ICON_NAMES } from './icon-names';
import { toolById, toolBySlug, tools, toolsInCategory, visibleCategories } from './registry';
import { LOCALES } from './types';

const contents = import.meta.glob('./*/content.*.md', { query: '?raw', eager: true });

describe('registry', () => {
  it('has unique ids', () => {
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(LOCALES)('has unique, url-safe slugs in %s', (l) => {
    const slugs = tools.map((t) => t.slug[l]);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every tool complete metadata in both languages', () => {
    for (const tool of tools) {
      expect(categories.map((c) => c.id)).toContain(tool.category);
      expect(ICON_NAMES).toContain(tool.icon);
      for (const l of LOCALES) {
        expect(tool.name[l], `${tool.id}.name.${l}`).toBeTruthy();
        expect(tool.title[l].length, `${tool.id}.title.${l}`).toBeLessThanOrEqual(65);
        expect(tool.description[l].length, `${tool.id}.description.${l}`).toBeGreaterThan(50);
        expect(tool.description[l].length, `${tool.id}.description.${l}`).toBeLessThanOrEqual(160);
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
