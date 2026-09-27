## Cómo funciona

Pega el JSON original a la izquierda y el modificado a la derecha. La herramienta los lee y compara su **estructura**, no el texto: da igual el orden de las claves, los espacios o que un número se escriba `1` o `1.0`. Cada diferencia sale con su ruta (`$.usuarios[0].email`) y un símbolo: `+` si la clave solo está en el modificado, `−` si solo está en el original y `~` si está en los dos con otro valor.

Arriba verás el resumen («2 añadidas · 1 eliminada · 3 cambiadas») y un filtro para ver solo un tipo de cambio. «Copiar informe» copia la lista en texto, una línea por cambio, para pegarla en una incidencia o en una revisión de código.

## Listas y documentos grandes

Las listas se comparan **posición a posición**: si insertas un elemento al principio, todos los que van detrás aparecerán como cambiados. La comparación recorre el documento sin recursión, así que aguanta JSON con miles de niveles de anidamiento, y se muestran como mucho 5000 cambios.
