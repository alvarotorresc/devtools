## Cómo funciona

Escribe una expresión regular y un texto de prueba: las coincidencias se resaltan al momento y la tabla muestra cada una con su posición y sus grupos de captura, incluidos los grupos con nombre (`(?<año>\d{4})`). Los flags se activan con interruptores; si pegas un literal como `/\d+/gi`, se separan solos la expresión y los flags.

Se usa el motor de JavaScript del navegador, así que el resultado es exactamente el que tendrás en tu código JS o TS. Otros lenguajes (PCRE, Python, Java) comparten casi toda la sintaxis, pero no toda: por ejemplo, JavaScript no tiene cuantificadores posesivos.

## Reemplazar y errores

En la pestaña **Reemplazar** puedes probar una sustitución con `$1`, `$<nombre>` o `$&` (toda la coincidencia) y ver el texto resultante y cuántos reemplazos se han hecho. Si la expresión tiene un error de sintaxis, en lugar del mensaje técnico verás qué falla y cómo arreglarlo, por ejemplo un paréntesis sin cerrar o un rango al revés. El mensaje original del motor queda plegado en «Detalle técnico». La chuleta plegable resume la sintaxis más usada.
