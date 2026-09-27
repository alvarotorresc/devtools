## Cómo funciona

Escribe una dirección IPv4 con su prefijo (`192.168.1.10/24`) o con su máscara (`192.168.1.10 255.255.255.0`). La herramienta calcula la **red**, la **máscara** y la máscara comodín, la dirección de **broadcast**, el primer y el último host, cuántos hosts se pueden usar y cuántas direcciones hay en total. También muestra la máscara en binario, para ver dónde acaba la parte de red.

La red se obtiene con un AND entre la IP y la máscara, y el broadcast poniendo a uno los bits de host. En una red normal se reservan la primera y la última dirección, así que una `/24` tiene 254 hosts útiles. Las `/31` son la excepción (RFC 3021): se usan en enlaces punto a punto, no tienen broadcast y las dos direcciones sirven. Una `/32` es un único equipo.

## Tipo de dirección

Además verás si la IP es **privada** (10/8, 172.16/12 y 192.168/16), de CGNAT, loopback, enlace local, de documentación, multicast, reservada o pública, y su clase histórica (A a E), que hoy solo es informativa. Los ceros a la izquierda (`010`) se rechazan porque algunos sistemas los leen en octal.
