## Para qué sirven

Al programar un formulario de pago necesitas números que tengan el aspecto de una tarjeta real: la longitud de su marca, el prefijo correcto (4 para Visa, 51–55 o 2221–2720 para Mastercard, 34 o 37 para American Express) y un último dígito que cuadre con el algoritmo de Luhn. Esta herramienta los genera al azar, con caducidad y CVV si los necesitas, y los valida: te dice la marca, agrupa el número como aparece en la tarjeta y avisa si la longitud es rara para esa marca.

Las pasarelas como Stripe publican sus propios números para el modo de pruebas, como `4242 4242 4242 4242`; los tienes debajo del generador. Úsalos cuando pruebes contra su entorno de test, porque solo ellos simulan pagos aceptados o rechazados.

## Cómo funciona Luhn

Se recorre el número de derecha a izquierda y se duplica una cifra de cada dos, empezando por la segunda; si el doble pasa de 9, se le resta 9. El número es válido si la suma total acaba en 0. Detecta cualquier cifra mal tecleada y casi cualquier par de cifras intercambiadas, pero no dice nada de si la tarjeta existe. Ni lo que escribes ni lo que generas se guarda en el navegador.
