## Cómo funciona

Los permisos Unix tienen tres representaciones y aquí están sincronizadas: el **octal** (`755`), el **simbólico** (`rwxr-xr-x`, el que ves con `ls -l`) y las **casillas** de propietario, grupo y otros. Cambia cualquiera y las demás se actualizan. Debajo tienes la orden `chmod` en las dos formas, lista para copiar, y una frase que explica quién puede hacer qué.

Cada cifra octal es la suma de lectura (4), escritura (2) y ejecución (1). La primera cifra es la del propietario, la segunda la del grupo y la tercera la de los demás. Con cuatro cifras, la primera son los bits especiales: setuid (4), setgid (2) y sticky (1).

## Bits especiales y avisos

En el simbólico, setuid y setgid aparecen como `s` en la posición de ejecución (o `S` si no hay ejecución), y sticky como `t` (o `T`). Si otros usuarios pueden escribir, la herramienta avisa: cualquier usuario del sistema podría modificar el archivo. Los botones rápidos ponen los valores más habituales: 644 para archivos, 755 para scripts y directorios, y 600 o 700 para lo privado.
