## Cómo funciona

Pega los datos y elige a qué formato quieres pasarlos. La herramienta detecta sola si la entrada es **JSON** (empieza por `{` o `[` y es válida), **CSV** (la primera línea tiene comas, puntos y coma o tabuladores, y hay filas con el mismo número de columnas) o **YAML**. También puedes indicar el formato a mano. El resultado se actualiza mientras escribes y puedes copiarlo o descargarlo.

El YAML se lee completo, versión 1.2: anclas y alias (`&base`, `*base`), claves de fusión (`<<`), bloques de texto y varios documentos separados por `---`, que se convierten en una lista. Si hay un error, verás la línea y la columna.

## CSV

Al leer un CSV se respetan los campos entre comillas con separadores, saltos de línea y comillas dobles dentro. Con «La primera fila es la cabecera» obtienes una lista de objetos; sin ella, una lista de filas. Para escribir un CSV hace falta una lista de objetos: las columnas son todas las claves que aparecen, los objetos anidados se aplanan como `direccion.ciudad` y las listas van en la celda como JSON. Recuerda que CSV no guarda tipos: al volver a leerlo, todo será texto salvo que actives «Detectar números y booleanos».
