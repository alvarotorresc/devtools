## Cómo funciona

En HTML, los caracteres `<`, `>`, `&`, `"` y `'` tienen significado propio. Para mostrarlos como texto hay que escribirlos como entidades: `&lt;`, `&gt;`, `&amp;`, `&quot;` y `&#39;`. Es lo mínimo para pegar un fragmento de código en una página o para evitar que un texto de usuario se interprete como HTML.

El modo **Además todo lo no-ASCII** convierte también tildes, símbolos y emojis: usa el nombre de la entidad cuando existe (`&aacute;`, `&euro;`, `&mdash;`) y el número en los demás casos (`&#128512;`). Sirve para plantillas de correo o sistemas antiguos que no garantizan UTF-8.

## Decodificar

Al pegar texto con entidades, la herramienta lo detecta y lo decodifica: entidades con nombre, decimales (`&#233;`) y hexadecimales (`&#xE9;`). Lo hace en una sola pasada, así que `&amp;lt;` queda como `&lt;` y no como `<`. Las entidades que no conoce se dejan tal cual. El resultado siempre se muestra como texto, nunca se inserta como HTML en la página.
