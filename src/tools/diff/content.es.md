## Cómo funciona

Pega el texto original a la izquierda y el modificado a la derecha. La herramienta busca la subsecuencia común más larga de líneas y marca como quitadas (−) las que solo están en el original y como añadidas (+) las que solo están en el modificado. Cuando una línea cambia, además resalta las palabras concretas que son distintas, para que no tengas que buscarlas a ojo.

La **vista unificada** muestra los cambios uno debajo de otro, como `git diff`. La **vista en paralelo** pone cada versión en una columna. Con «Solo cambios» se ocultan los tramos largos sin cambios y se dejan tres líneas de contexto alrededor de cada diferencia.

## Opciones

«Ignorar espacios» trata como iguales las líneas que solo cambian en espacios, tabuladores o espacios al final; «Ignorar mayúsculas» hace lo mismo con las mayúsculas. Son útiles para comparar código reformateado o listas copiadas de sitios distintos. El contador de la cabecera resume cuántas líneas se añadieron y cuántas se quitaron, y «Copiar diff» copia el resultado en texto plano.
