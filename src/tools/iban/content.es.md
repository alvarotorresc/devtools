## Cómo se valida un IBAN

Un IBAN empieza por el código del país y dos dígitos de control, seguidos de la cuenta nacional (el BBAN). Para comprobarlo se mueven los cuatro primeros caracteres al final, cada letra se convierte en dos cifras (A = 10, B = 11… Z = 35) y el número resultante dividido entre 97 debe dar resto 1. El validador hace ese cálculo cifra a cifra, así que funciona con IBAN de hasta 34 caracteres sin perder precisión, y antes comprueba que el país use IBAN y que la longitud sea la suya: 24 en España, 27 en Francia, 22 en Alemania.

## Cuentas españolas: el CCC

En España el BBAN es el antiguo CCC: entidad (4 cifras), oficina (4), dos dígitos de control y número de cuenta (10). Esos dos dígitos tienen su propia fórmula, con pesos 1, 2, 4, 8, 5, 10, 9, 7, 3 y 6, y el validador también la comprueba: un IBAN puede cuadrar por fuera y tener mal la cuenta. Si pegas un CCC de 20 cifras, te da su IBAN.

La pestaña Generar crea IBAN españoles con códigos de entidades reales y cuentas al azar, con todos los dígitos de control correctos, para rellenar formularios de prueba. Ni lo que escribes ni lo que generas se guarda en el navegador: un número de cuenta es un dato financiero.
