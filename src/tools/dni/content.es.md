## Cómo se calcula la letra

La letra del DNI es un dígito de control: se divide el número de 8 cifras entre 23 y el resto indica la posición en la tabla `TRWAGMYFPDXBNJZSQVHLCKE`. Para 12345678 el resto es 14, así que la letra es la Z. Si una cifra está mal copiada, la letra casi nunca cuadra, y por eso el validador detecta al momento un DNI con una errata.

El NIE de los extranjeros usa la misma fórmula: la letra inicial se cambia por un número (X por 0, Y por 1 y Z por 2) y se calcula sobre las 8 cifras resultantes. Los NIF que empiezan por K, L o M son de personas sin DNI y se comprueban en el validador de CIF.

## Validar muchos a la vez y generar para pruebas

Puedes pegar una columna entera de una hoja de cálculo, uno por línea. Cada fila dice si es válida y, si no, qué falla: la letra correcta, las cifras que faltan o el prefijo del NIE. Si un DNI de 7 cifras perdió el cero inicial, se añade y se avisa.

La pestaña Generar crea DNI y NIE con la letra correcta para rellenar formularios de prueba o bases de datos de desarrollo. Con una semilla obtienes siempre la misma lista, útil para tests reproducibles. Nada de lo que escribes se guarda: un DNI es un dato personal.
