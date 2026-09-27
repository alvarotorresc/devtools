## Cómo funciona

Elige una fecha de inicio y una de fin y verás, para ese intervalo, los **días naturales** (también en semanas y días), los **laborables** (de lunes a viernes), los **hábiles** (de lunes a viernes sin festivos nacionales) y los de fin de semana. Con «Incluir el día final» activado se cuentan los dos extremos; desactivado, el día final queda fuera. Todos los recuentos usan el mismo conjunto de días.

Los festivos nacionales se calculan para cualquier año entre 1900 y 2100, sin tablas que haya que actualizar: los nueve fijos (Año Nuevo, Epifanía, 1 de mayo, 15 de agosto, 12 de octubre, 1 de noviembre, 6 y 8 de diciembre y Navidad) y el **Viernes Santo**, que es el viernes anterior al domingo de Pascua. La Pascua se calcula con el algoritmo gregoriano de Meeus/Jones/Butcher. La lista del resultado marca los festivos que caen en fin de semana, porque esos no restan días hábiles.

## Lo que no incluye

Solo cuenta los festivos comunes a toda España. No incluye los autonómicos ni los locales (como Jueves Santo, San José o las fiestas patronales), ni los traslados que hacen las comunidades cuando un festivo cae en domingo. Si tu plazo depende de ellos, réstalos a mano. Las cuentas se hacen en días UTC, así que los cambios de hora de marzo y octubre no añaden ni quitan un día.
