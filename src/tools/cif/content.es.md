## Qué comprueba

Un CIF (el NIF de una empresa o entidad) tiene tres partes: una letra que indica la forma jurídica (B para una sociedad limitada, A para una anónima, G para una asociación…), siete cifras y un carácter de control. El control se calcula con las siete cifras: se suman las de posición par, se duplican las de posición impar sumando las cifras del resultado, y el complemento a 10 de la suma es el control. Si la entidad lleva letra, esa cifra se traduce con la tabla `JABCDEFGHI`.

Unas entidades llevan siempre cifra (A, B, E y H), otras siempre letra (N, P, Q, S y W) y el resto admite las dos. El validador solo es estricto donde las fuentes oficiales coinciden, y cuando falla te dice qué control esperaba y en qué forma.

## NIF de personas y datos de prueba

Los NIF que empiezan por K, L o M no son de empresas: son de personas sin DNI (menores de 14 años, españoles que viven fuera y extranjeros sin NIE). Se validan con la tabla de letras del DNI y, al ser datos personales, nunca se guardan en el navegador aunque tengas activado «Recordar lo que escribo». Lo mismo pasa si pegas por error un DNI o un NIE: en cuanto una línea lo parece, no se guarda nada de lo que escribes.

La pestaña Generar crea CIF con el control correcto del tipo que elijas, útiles para facturas y formularios de prueba. Son números al azar: que un CIF sea válido no significa que la empresa exista.
