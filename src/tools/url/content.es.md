## Cómo funciona

Las URL solo admiten un conjunto limitado de caracteres. El resto (espacios, tildes, `&` dentro de un valor…) se escribe como `%` seguido de dos cifras hexadecimales por cada byte UTF-8: un espacio es `%20` y una «é» es `%C3%A9`. Esta herramienta codifica y decodifica mientras escribes y detecta la dirección sola: si el texto ya tiene secuencias `%XX`, lo decodifica.

Hay dos modos. **Componente** (`encodeURIComponent`) escapa también `/ ? & = #`, y es el que necesitas para el valor de un parámetro. **URL completa** (`encodeURI`) respeta esos caracteres para no romper la estructura de la dirección. En formularios HTML el espacio se envía como `+`; activa «Leer + como espacio» para decodificarlos.

## Analizar una URL

La pestaña **Analizar URL** separa protocolo, usuario, host, puerto (o el de por defecto, 443 en HTTPS), ruta y fragmento, y lista los parámetros de consulta ya decodificados, cada uno con su botón de copiar. Si pegas una dirección sin `https://`, se supone ese esquema. Es útil para revisar enlaces de campañas con muchos `utm_`, redirecciones o callbacks de OAuth.
