## Cómo funciona

Pega un comando `curl` y la herramienta lo convierte en una llamada a `fetch` de JavaScript mientras escribes. Entiende las comillas simples y dobles, `$'…'`, las barras invertidas y los comandos partidos en varias líneas con `\`, igual que bash. Lo más rápido es copiar la petición desde la pestaña Red del navegador con «Copiar como cURL (bash)».

Se traducen el método (`-X`, `-I`, `-G`), las cabeceras (`-H`), el cuerpo (`-d`, `--data-raw`, `--data-urlencode`, `--json`), los formularios (`-F`), la autenticación básica (`-u`), el referer, las cookies y el tiempo máximo (`-m`, con `AbortSignal.timeout`). Si el cuerpo es JSON, se escribe con `JSON.stringify` para que sea fácil de editar. Lo que es el valor por defecto de fetch, como el método GET, se omite.

## Lo que fetch no puede hacer

Hay opciones de curl que no tienen equivalente en el navegador: leer archivos del disco (`@archivo`), ignorar errores de certificado (`-k`) o cambiar el `User-Agent` y las cookies a mano. En esos casos verás un aviso que explica qué hacer. Por seguridad, el comando no se guarda: los cURL copiados del navegador suelen llevar cookies y tokens.
