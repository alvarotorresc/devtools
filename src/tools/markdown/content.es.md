## Cómo funciona

Escribe o pega Markdown y la vista previa se actualiza mientras escribes. Usa el dialecto de GitHub (GFM): tablas con alineación, listas de tareas con `- [ ]` y `- [x]`, bloques de código con su lenguaje, texto tachado con `~~` y enlaces automáticos para las URL sueltas. Un salto de línea simple no parte el párrafo, igual que en GitHub; deja una línea en blanco para empezar otro.

La pestaña **HTML** muestra el código que genera el Markdown, listo para copiar y pegar en una web, un correo o un CMS.

## Seguridad

Markdown admite HTML dentro del texto, así que un documento puede traer un `<script>` o un `onerror`. Antes de mostrar nada, el HTML pasa por DOMPurify, que elimina scripts, manejadores de eventos, enlaces `javascript:`, formularios e iframes. Lo que copias es ese HTML saneado. Los enlaces se abren en otra pestaña y las imágenes de otros servidores no se cargan hasta que lo permites.
