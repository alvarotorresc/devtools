## Cómo funciona

Escribe o pega uno o varios títulos, uno por línea, y obtendrás su slug: la parte de la URL que identifica una página, como `mi-primer-articulo`. Se quitan las tildes y las diéresis (`á` → `a`, `ñ` → `n`), las letras especiales se escriben con letras normales (`ß` → `ss`, `æ` → `ae`, `ø` → `o`) y todo lo que no es una letra o una cifra, incluidos los emojis, se convierte en el separador.

Con «& como y», `Pérez & Hijos` da `perez-y-hijos` en lugar de `perez-hijos`. Puedes elegir el separador (`-`, `_` o `.`) y mantener las mayúsculas si tu sistema las distingue.

## Longitud máxima

Los slugs cortos se leen y se comparten mejor. Si fijas una longitud máxima, el slug se corta en el último separador antes del límite, sin partir palabras, salvo que la primera palabra ya sea más larga. Si un texto no tiene ninguna letra latina (por ejemplo, 東京), el slug quedaría vacío y se avisa.
