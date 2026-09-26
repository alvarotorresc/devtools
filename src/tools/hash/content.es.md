## Cómo funciona

Una función hash convierte cualquier entrada en una huella de longitud fija. El mismo texto da siempre el mismo hash y cualquier cambio, por pequeño que sea, da uno totalmente distinto. Por eso se usan para comprobar que un archivo descargado no se ha corrompido o para detectar cambios.

La herramienta calcula a la vez **MD5**, **SHA-1**, **SHA-256**, **SHA-384** y **SHA-512** mientras escribes. SHA usa la Web Crypto API del navegador; MD5 no está en esa API y se calcula con una implementación propia comprobada contra los vectores de prueba del RFC 1321. El texto se codifica como UTF-8 antes de resumirlo, igual que hacen `sha256sum` o la mayoría de lenguajes.

## Comparar y archivos

Pega en «Comparar con» el hash que te han dado (en mayúsculas, con espacios o con dos puntos, da igual) y el indicador dirá con qué algoritmo coincide. En la pestaña **Archivo** puedes calcular los hashes de un archivo sin subirlo a ningún sitio.

MD5 y SHA-1 ya no son seguros frente a ataques: sirven para detectar errores, no para firmar ni para guardar contraseñas. Para contraseñas usa un algoritmo lento como Argon2 o bcrypt.
