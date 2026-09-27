## Cómo funciona

El User-Agent es el texto con el que el navegador se presenta en cada petición: `Mozilla/5.0 (Windows NT 10.0; …) Firefox/128.0`. Al abrir la herramienta se rellena con el de tu navegador; también puedes pegar uno de un registro del servidor o de una incidencia. Se analiza con `ua-parser-js`, una base de patrones que se actualiza a menudo, y verás el navegador y su versión, el motor, el sistema operativo, el dispositivo (fabricante, modelo y tipo) y la arquitectura de la CPU.

Si el texto contiene palabras como `bot`, `crawler` o `spider`, se avisa de que parece un rastreador. Los navegadores de escritorio no suelen indicar el tipo de dispositivo, así que en ese caso se muestra «Escritorio (probable)».

## User-Agent congelado y Client Hints

Desde 2021, Chrome, Edge y otros navegadores basados en Chromium congelan parte del User-Agent para reducir el rastreo: la versión menor sale siempre a cero y Windows 11 aparece como Windows 10. La información precisa se pide aparte con las **Client Hints**. Cuando analizas el User-Agent de tu propio navegador, la herramienta añade las de baja entropía: las marcas, la plataforma y si es un móvil.
