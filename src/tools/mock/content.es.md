## Datos que encajan entre sí

Cada fila es una persona ficticia completa y coherente: el email sale de su nombre y apellido (sin tildes, `maria.ibanez@example.com`), el código postal y la ciudad son de la misma provincia, la letra del DNI o del NIE es correcta y el CIF de su empresa es de tipo A si es una S.A. y de tipo B si es una S.L. Los emails usan los dominios reservados `example.com`, `example.org` y `example.net`, que nunca llegan a un buzón real, así que puedes cargar los datos en un entorno de pruebas sin miedo a escribir a nadie.

Elige las columnas, cámbiales el nombre y ordénalas; añade campos de número, fecha o una lista de valores propios. Quitar o mover columnas no cambia los valores de las demás, porque cada fila se genera siempre entera y en el mismo orden.

## JSON, CSV o SQL, siempre iguales con semilla

La salida puede ser un array JSON (con números y booleanos de su tipo), un CSV con cabecera o una sentencia `INSERT` por fila con los textos bien escapados. La vista previa muestra 20 filas; copiar y descargar llevan todas. Con una semilla, la misma configuración da los mismos datos en cualquier navegador. Sin ella, los datos cambian al pulsar Generar.

El modo «Datos internacionales» usa nombres, calles y ciudades genéricas en inglés y el rango de teléfonos 555-01XX, reservado para la ficción. En ese modo se desactivan los campos que solo tienen sentido en España, como el DNI o el IBAN.
