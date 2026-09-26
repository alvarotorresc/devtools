## Cómo está formado

El número de afiliación a la Seguridad Social (NSS o NAF) tiene 12 cifras: 2 de la provincia donde se dio de alta, 8 de número y 2 de control. El código de provincia es el mismo que el del código postal y el del INE: 28 es Madrid y 08 es Barcelona. Lo verás escrito con barras (`28/12345678/40`), con espacios o todo seguido, y el validador acepta cualquiera de esas formas.

## La fórmula de control

El control es el resto de dividir entre 97 un número formado por la provincia y el número, pero la forma de juntarlos depende del tamaño del número. Si es menor de 10 000 000, se calcula `número + provincia × 10 000 000`; si no, se ponen la provincia y el número uno detrás de otro. Muchas calculadoras solo aplican la segunda regla y dan por malos números correctos de la primera: esta herramienta aplica las dos.

Un código de provincia fuera de 01–52 no se da por error, porque hay números antiguos o especiales que lo tienen: solo sale un aviso. La pestaña Generar crea números válidos de la provincia que elijas para rellenar formularios de prueba. Nada de lo que escribes se guarda: es un identificador personal.
