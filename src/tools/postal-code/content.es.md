## Las dos primeras cifras

En España las dos primeras cifras del código postal son el código de la provincia, el mismo que usa el INE: 28 es Madrid, 08 Barcelona, 46 Valencia y 52 Melilla. Por eso basta con el código postal para saber la provincia, la comunidad autónoma y la capital, aunque no el municipio. Si pegas una columna de códigos, cada línea muestra su provincia y puedes copiar todos normalizados.

## El 0 que se pierde

Las hojas de cálculo tratan `08001` como un número y lo guardan como `8001`. La herramienta reconoce los códigos de 4 cifras, les añade el 0 inicial y te lo dice, para que puedas corregir la columna de origen. Los prefijos 00 y del 53 al 99 no existen y se marcan como error.

Con «Buscar por provincia» ves el rango de códigos de cada una (de 28000 a 28999 en Madrid). Saber el municipio exacto de un código necesitaría la base de datos de Correos, que no se incluye.
