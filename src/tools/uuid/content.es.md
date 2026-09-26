## ¿Qué identificador elegir?

**UUID v4** es el clásico: 122 bits aleatorios, sin orden. Sirve para casi todo, pero como claves primarias en bases de datos fragmenta los índices porque cada valor cae en un sitio al azar.

**UUID v7** guarda la fecha en milisegundos en los primeros 48 bits, así que los identificadores nuevos quedan ordenados en el tiempo. Es la opción recomendada hoy para claves primarias: mantiene la unicidad de un UUID y los índices crecen al final, como con un autoincremental.

**ULID** tiene la misma idea que v7, pero en 26 caracteres en base32 (sin letras ambiguas como I, L, O o U). Es más corto y fácil de leer en URLs y logs.

**NanoID** es un identificador aleatorio corto y configurable: eliges longitud y alfabeto. Con 21 caracteres URL-safe tiene una probabilidad de colisión parecida a la de un UUID v4.

## Validar

La pestaña Validar reconoce UUID de cualquier versión (con o sin guiones, en mayúsculas o minúsculas), el UUID nulo y el máximo, y los ULID. En v7 y ULID muestra la fecha exacta en la que se creó el identificador.
