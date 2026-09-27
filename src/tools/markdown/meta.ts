import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'markdown',
  category: 'data',
  icon: 'file-text',
  slug: { es: 'vista-previa-markdown', en: 'markdown-preview' },
  name: { es: 'Markdown', en: 'Markdown' },
  title: {
    es: 'Vista previa de Markdown online (GFM) y a HTML',
    en: 'Markdown preview online (GFM) and Markdown to HTML',
  },
  description: {
    es: 'Escribe Markdown y ve el resultado al momento, con tablas, listas de tareas y código de GitHub. Copia el HTML ya saneado. Todo en tu navegador.',
    en: 'Write Markdown and see it rendered instantly, with GitHub tables, task lists and code blocks. Copy the sanitised HTML. Runs in your browser.',
  },
  keywords: {
    es: [
      'vista previa markdown',
      'markdown a html',
      'editor markdown online',
      'gfm',
      'markdown github',
      'convertir markdown',
    ],
    en: [
      'markdown preview',
      'markdown to html',
      'online markdown editor',
      'gfm',
      'github markdown',
      'convert markdown',
    ],
  },
  tabs: { es: ['Vista previa', 'HTML'], en: ['Preview', 'HTML'] },
  faq: {
    es: [
      {
        q: '¿Se ejecuta el HTML o el JavaScript que escribo?',
        a: 'No. Antes de mostrarlo, el HTML pasa por DOMPurify, que quita scripts, atributos como onerror y enlaces javascript:. Formularios, iframes y estilos también se eliminan.',
      },
      {
        q: '¿Por qué no se ven mis imágenes?',
        a: 'Las imágenes de otros servidores no se cargan hasta que activas «Cargar imágenes externas», para que la vista previa no avise a nadie de que la estás abriendo. Las imágenes data: sí se muestran.',
      },
    ],
    en: [
      {
        q: 'Does the HTML or JavaScript I write run?',
        a: 'No. Before it is shown, the HTML goes through DOMPurify, which strips scripts, attributes such as onerror and javascript: links. Forms, iframes and styles are removed too.',
      },
      {
        q: 'Why are my images not showing?',
        a: 'Images from other servers are not loaded until you turn on “Load external images”, so the preview does not tell anyone you are opening it. data: images are shown.',
      },
    ],
  },
};
