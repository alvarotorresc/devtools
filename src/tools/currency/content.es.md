## Cómo funciona

Escribe un importe, elige la divisa de origen y la de destino, y el resultado aparece al momento, junto al tipo unitario en los dos sentidos («1 USD = 0,909091 EUR») y el mismo importe en todas las divisas disponibles. El botón de intercambiar da la vuelta al par.

Los tipos son los de **referencia del Banco Central Europeo**, que se publican una vez por día hábil hacia las 16:00 (hora de Madrid) para unas 30 divisas. La herramienta descarga la tabla completa de `api.frankfurter.dev`, sin parámetros, y hace la conversión en tu navegador: ni el importe ni las divisas que eliges salen de tu equipo.

## Sin conexión

La última tabla descargada se guarda en tu navegador con su fecha. Si no hay conexión, se usa esa tabla y se avisa de qué día es. Se vuelve a descargar cuando han pasado más de 6 horas.

Los tipos de referencia no son los que te aplicará un banco, una tarjeta o una casa de cambio: esos llevan su propio margen y, a veces, una comisión. Úsalos para hacerte una idea o para cálculos internos.
