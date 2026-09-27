## Cómo funciona

Elige qué quieres codificar: un **texto** libre, una **URL** o los datos de una red **WiFi**. El código QR se genera en tu navegador mientras escribes y puedes descargarlo como PNG (256, 512 o 1024 píxeles) o como SVG, que se puede ampliar sin perder calidad para imprimirlo. Siempre es negro sobre blanco, con su margen, porque es lo que leen bien todas las cámaras.

El texto se codifica en UTF-8, así que las tildes, la ñ y los emojis se leen bien en cualquier móvil. Si una URL no lleva `https://`, se añade y se avisa. La corrección de errores (L, M, Q o H) decide cuánto daño aguanta el código: más corrección significa un código más denso y menos espacio para el texto.

## Códigos QR de WiFi

La pestaña WiFi crea el código que los móviles reconocen para conectarse sin escribir la contraseña: `WIFI:T:WPA;S:red;P:clave;;`. Los caracteres especiales del nombre y de la contraseña se escapan como pide el formato. El nombre de la red se puede recordar en este navegador, pero **la contraseña no se guarda nunca**.
