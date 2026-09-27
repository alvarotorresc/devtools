## Cómo funciona

Una expresión cron tiene cinco campos separados por espacios: **minuto** (0–59), **hora** (0–23), **día del mes** (1–31), **mes** (1–12 o `JAN`–`DEC`) y **día de la semana** (0–7, donde 0 y 7 son domingo, o `SUN`–`SAT`). Cada campo admite `*` (todos), un valor (`5`), un rango (`1-5`), una lista (`1,15`) y pasos (`*/15`, `0-30/10`). También valen los atajos `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly` y `@reboot`.

La herramienta explica la expresión en palabras y calcula las próximas ejecuciones en la zona horaria que elijas, con la fecha local, cuánto falta y la hora exacta en UTC para copiarla.

## Día del mes, día de la semana y cambios de hora

Si los campos de día del mes y de día de la semana tienen los dos un valor, cron ejecuta la tarea cuando se cumple **cualquiera** de ellos: `0 9 1 * 1` corre el día 1 y además cada lunes. En los cambios de hora se sigue la regla de Vixie cron, el de casi todas las distribuciones de Linux: una hora que no existe se ejecuta en el primer minuto válido tras el salto, y una hora que se repite, solo la primera vez.
