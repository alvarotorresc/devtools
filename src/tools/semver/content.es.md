## Cómo funciona

Escribe un rango de versiones como los de `package.json` y, debajo, las versiones que quieras comprobar, una por línea. La herramienta usa `semver`, la misma librería que npm, así que el resultado coincide con lo que instalaría `npm install`. Cada versión se marca como «cumple» o «no cumple», y verás cuál es la más alta que encaja y cuál es la mínima que admite el rango.

El rango se muestra también **normalizado** (`^1.2.3` → `>=1.2.3 <2.0.0-0`) y explicado en palabras. El `-0` final significa que el límite superior deja fuera también las prereleases de esa versión, como `2.0.0-beta`.

## Prereleases

Por defecto, npm no deja entrar una prerelease (`1.3.0-rc.1`) en un rango salvo que el rango mencione una prerelease de la misma versión. Es una protección para no instalar betas sin querer. Si activas «Incluir prereleases», se comprueban como cualquier otra versión.
