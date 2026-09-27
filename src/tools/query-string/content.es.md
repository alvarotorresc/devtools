## Cómo funciona

Pega una URL completa, la parte que va después de `?` o un JSON. Si el texto empieza por `{`, se convierte de JSON a query string; si no, de query string a JSON. También puedes fijar la dirección. Cada parámetro se parte en el primer `=`, el `+` se lee como espacio y las secuencias `%XX` se decodifican. Si una secuencia está mal formada, se deja tal cual y se avisa.

Las claves repetidas (`b=2&b=3`) se convierten en una lista. Con la **notación con corchetes**, la que usan PHP, Rails o la librería `qs`, `filtro[precio]=10` se lee como un objeto y `tags[]=a&tags[]=b` como una lista. Debajo verás una tabla con todos los pares ya decodificados.

## De JSON a query string

El JSON tiene que ser un objeto. Los valores se codifican con `encodeURIComponent`, `null` queda como `clave=`, las listas salen como claves repetidas o con `[]`, y los objetos anidados como `a[b]=1`. Las claves con aspecto de credencial (`token`, `password`, `api_key`, `session`…) hacen que la entrada no se guarde en el navegador.
