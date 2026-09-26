## Cómo funciona

Pega o escribe JSON y la herramienta lo analiza mientras escribes. Si es válido, lo verás formateado con la sangría que elijas (2 espacios, 4 o tabulador), o minificado en una sola línea para enviarlo por una API o guardarlo en una variable de entorno.

Si hay un error, la pantalla indica la línea y la columna exactas y muestra esa línea con una marca debajo del carácter que falla. Los fallos más habituales son las comas al final de un objeto o una lista, las comillas simples y las claves sin comillas: el estándar JSON no admite ninguno de los tres.

## Ordenar claves y explorar el árbol

«Ordenar claves» ordena alfabéticamente las claves de todos los objetos, también los que están dentro de listas. Es útil para comparar dos respuestas de una API con la herramienta de diferencias.

La pestaña **Árbol** muestra el documento como una estructura plegable. Cada nodo permite copiar su ruta (por ejemplo `$.usuarios[0].email`) o su valor, lo que ahorra tiempo al escribir tests o consultas con `jq`.
