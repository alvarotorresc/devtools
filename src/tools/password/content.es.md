## Cómo funciona

Elige la longitud, cuántas contraseñas quieres y qué tipos de carácter usar: minúsculas, mayúsculas, números y los 32 símbolos ASCII. Cada contraseña lleva al menos un carácter de cada tipo activo; el resto se elige al azar entre todos y al final se mezclan. El azar sale de `crypto.getRandomValues`, el generador criptográfico del navegador, sin sesgo al elegir cada carácter.

«Excluir caracteres ambiguos» quita `0 O o 1 l I |`, que se confunden al leerlos en voz alta o copiarlos a mano. Se genera una contraseña nueva al cambiar cualquier opción y cada vez que pulsas «Generar».

## Entropía

La barra de fuerza usa la entropía: longitud × log2(número de caracteres posibles). Con 20 caracteres de los 94 posibles salen 131 bits. Por debajo de 50 bits es **débil**, hasta 80 es **aceptable** y a partir de ahí es **fuerte**. Alargar la contraseña suma más que añadir símbolos. Las contraseñas no se guardan nunca, ni siquiera en tu navegador; solo se recuerdan las opciones.
