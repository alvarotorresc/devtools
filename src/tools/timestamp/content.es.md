## Qué es un timestamp Unix

Un timestamp Unix (o _epoch time_) es el número de segundos transcurridos desde el 1 de enero de 1970 a las 00:00 UTC. Es la forma habitual de guardar fechas en bases de datos, logs y APIs porque no depende de la zona horaria. JavaScript, Java y muchas APIs usan milisegundos en lugar de segundos, así que el mismo instante puede aparecer con 10 o con 13 cifras.

## Cómo funciona

Arriba tienes el reloj Unix en vivo, en segundos y en milisegundos, con un botón de copiar para cada uno. Al escribir un timestamp, la herramienta detecta si está en segundos o en milisegundos y muestra la fecha a la vez en ISO 8601, en UTC, en la zona horaria que elijas (con su desfase respecto a UTC) y en tiempo relativo («hace 3 días»).

Para el camino inverso, escribe una fecha como `2026-09-26 14:30`. Si no lleva zona (`Z` o `+02:00`), se interpreta en la zona horaria elegida, teniendo en cuenta el horario de verano. La zona por defecto es la de tu navegador.
