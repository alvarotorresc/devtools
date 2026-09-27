## Cómo funciona

Cada respuesta HTTP empieza por un código de tres cifras que resume qué ha pasado. La primera cifra indica la familia: **1xx** informativos, **2xx** éxito, **3xx** redirecciones, **4xx** errores del cliente y **5xx** errores del servidor. Aquí tienes todos los códigos del registro de IANA con su nombre oficial en inglés, su nombre en español, una explicación corta, cuándo conviene usarlos y el RFC que los define.

Busca por número (escribe `40` para ver del 400 al 409) o por palabras en español o en inglés, sin preocuparte por las tildes. También puedes filtrar por familia y enlazar directamente a un código con `#404` al final de la dirección.

## Los que más se confunden

`401` es «no sé quién eres» y `403`, «sé quién eres y no puedes pasar». `400` es una petición mal formada y `422`, una petición bien formada con datos que no pasan la validación. En las redirecciones, `307` y `308` conservan el método y el cuerpo, mientras que con `301` y `302` muchos clientes cambian un POST por un GET. El `418` es una broma de 1998 que RFC 9110 reserva para que nadie lo reutilice.
