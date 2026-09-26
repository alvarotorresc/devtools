## Cómo funciona

Elige un color con el selector o escribe su valor en cualquiera de los cuatro formatos: **HEX** (`#58a6ff`), **RGB**, **HSL** u **OKLCH**. Todos los campos están sincronizados: al cambiar uno, los demás se actualizan. Se aceptan la sintaxis moderna de CSS (`rgb(88 166 255)`) y la clásica con comas.

**OKLCH** describe el color por luminosidad percibida (L), croma (C) y tono (H). A diferencia de HSL, dos colores con la misma L se ven igual de claros, lo que facilita crear paletas coherentes y variantes accesibles. Algunos valores OKLCH quedan fuera de lo que puede mostrar una pantalla sRGB; en ese caso se ajustan al color más cercano y se avisa.

## Contraste WCAG

La herramienta calcula el contraste del color con blanco y con negro según WCAG 2.x. Para texto normal hace falta 4,5:1 (AA) o 7:1 (AAA); para texto grande (24 px, o 18,66 px en negrita), 3:1 y 4,5:1. Así sabes al momento si un color sirve para texto sobre fondo claro u oscuro.
