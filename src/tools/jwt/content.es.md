## Qué es un JWT

Un JSON Web Token son tres partes en Base64url separadas por puntos: la **cabecera** (algoritmo y tipo), el **payload** (los datos o _claims_) y la **firma**. Las dos primeras no están cifradas, solo codificadas: cualquiera que tenga el token puede leerlas. Por eso no conviene meter en un JWT nada que no deba ver el usuario.

Esta herramienta decodifica la cabecera y el payload al pegar el token (también si lleva delante `Bearer `) y los muestra formateados. Las fechas estándar se traducen a tu hora local y a tiempo relativo: `exp` (caduca), `nbf` (no válido antes de) e `iat` (emitido). El indicador dice si el token está vigente, caducado o aún no es válido.

## Lo que no hace

No verifica la firma: para eso hace falta la clave del emisor, y ese paso debe hacerse en tu servidor. Un token que se decodifica bien puede estar falsificado. Tampoco guarda nada: el token no se escribe en el almacenamiento del navegador y desaparece al cerrar la página.
