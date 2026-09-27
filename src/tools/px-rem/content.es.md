## Cómo funciona

Los tres campos (px, rem y em) están sincronizados: escribe en cualquiera y los otros dos se recalculan. `rem = px / base` y `em = px / padre`. El tamaño base es el `font-size` del elemento `html`, que en casi todos los navegadores es 16 px; el del padre solo afecta a em y, si lo dejas vacío, es igual que la base.

Los valores se muestran siempre con punto decimal, también en español, porque son valores de CSS: así lo que copias funciona tal cual en tu hoja de estilos. Al escribir puedes usar coma o punto.

## Por qué usar rem

Un tamaño en rem respeta el tamaño de letra que el usuario ha elegido en su navegador; uno en px, no. Por eso rem es la opción recomendada para textos, márgenes y espacios. La tabla de tamaños habituales te da el valor en rem de 10 a 64 px con la base actual, y el fragmento CSS incluye el valor en px como comentario.
