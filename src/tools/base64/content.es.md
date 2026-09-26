## Cómo funciona

Base64 representa datos binarios con 64 caracteres seguros (letras, números, `+` y `/`), de modo que se pueden meter en JSON, en un correo o en una URL sin que se rompan. Cada 3 bytes se convierten en 4 caracteres, así que el resultado ocupa un tercio más que el original.

Escribe texto y se codifica al momento; pega Base64 y se decodifica. La herramienta detecta la dirección: solo decodifica si el texto es Base64 válido y el resultado es texto legible, así que una palabra como «hola» se codifica aunque use letras permitidas. Si se equivoca, fija la dirección a mano. El texto se trata como UTF-8, por lo que tildes, eñes y emojis funcionan.

## URL-safe y archivos

La variante URL-safe (RFC 4648) cambia `+` por `-` y `/` por `_` y quita el relleno `=`. Es la que usan los JWT y la que conviene para meter Base64 en una URL. Al decodificar se aceptan las dos variantes.

En la pestaña **Archivo** puedes convertir una imagen o un PDF en un data URI (`data:image/png;base64,…`) listo para pegar en CSS o HTML, o hacer el camino inverso: pegar Base64 o un data URI y descargar el archivo. El tipo se detecta por la cabecera del archivo cuando el data URI no lo indica.
