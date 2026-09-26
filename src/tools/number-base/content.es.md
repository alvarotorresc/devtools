## Cómo funciona

Escribe un número en cualquiera de los campos (binario, octal, decimal, hexadecimal o una base personalizada de 2 a 36) y los demás se actualizan al momento. Se aceptan los prefijos habituales `0b`, `0o` y `0x`, el signo negativo y los separadores `_` o espacio, así que puedes pegar valores directamente desde el código.

Los cálculos usan `BigInt`, de modo que no hay límite de tamaño: un número de 64 bits como `18446744073709551616` o una clave de cientos de cifras se convierten sin perder precisión, algo que falla con los números normales de JavaScript por encima de 2^53.

## Agrupación y bases

«Agrupar dígitos» separa en grupos de 4 el binario y el hexadecimal (un nibble cada uno) y de 3 el decimal y el octal, para leer valores largos sin equivocarte. La base personalizada sirve, por ejemplo, para base 36, que usan algunos acortadores de URL e identificadores. Si escribes una cifra que no existe en la base, el campo te dice qué cifras valen.
