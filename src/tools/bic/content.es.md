## Cómo se lee un BIC

El BIC (o código SWIFT) identifica a un banco en las transferencias internacionales. Tiene 8 u 11 caracteres: 4 letras para el banco (`CAIX` es CaixaBank), 2 para el país (`ES`), 2 letras o cifras para la localidad (`BB`) y, opcionalmente, 3 para la sucursal. Si no hay sucursal, o es `XXX`, se refiere a la oficina principal, así que `CAIXESBB` y `CAIXESBBXXX` son el mismo código.

El validador comprueba la forma y que el país sea un código ISO 3166 vigente (más Kosovo, `XK`, que SWIFT usa). Cuando la localidad lleva un 0 como segundo carácter, avisa de que es un BIC de pruebas, que no sirve para operaciones reales.

## Lo que no hace

No tiene la base de datos de SWIFT, así que no dice a qué banco pertenece un código ni si está dado de alta: solo si su formato es correcto. Para una transferencia SEPA dentro de la zona euro normalmente basta con el IBAN; el BIC se sigue pidiendo en pagos internacionales fuera de ella.
