export interface StatusCode {
  code: number;
  /** Reason phrase as registered by IANA (English). */
  phrase: string;
  /** Spanish name. */
  es: string;
  desc: { es: string; en: string };
  /** When to use it, when it helps. */
  when?: { es: string; en: string };
  ref: string;
  note?: 'joke' | 'unused' | 'historic';
}

export type Group = 'all' | '1' | '2' | '3' | '4' | '5';

// Source: IANA HTTP Status Code Registry and the RFCs cited, checked on 2026-09-26.
export const CODES: readonly StatusCode[] = [
  {
    code: 100,
    phrase: 'Continue',
    es: 'Continuar',
    desc: {
      es: 'El servidor ha recibido las cabeceras y el cliente puede enviar el cuerpo.',
      en: 'The server got the headers and the client may send the body.',
    },
    when: {
      es: 'Respuesta a Expect: 100-continue antes de subir un cuerpo grande.',
      en: 'Reply to Expect: 100-continue before uploading a large body.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 101,
    phrase: 'Switching Protocols',
    es: 'Cambiando de protocolo',
    desc: {
      es: 'El servidor acepta cambiar al protocolo que pide la cabecera Upgrade.',
      en: 'The server agrees to switch to the protocol named in the Upgrade header.',
    },
    when: { es: 'Al abrir un WebSocket.', en: 'When opening a WebSocket.' },
    ref: 'RFC 9110',
  },
  {
    code: 102,
    phrase: 'Processing',
    es: 'Procesando',
    desc: {
      es: 'WebDAV: la petición sigue en curso y aún no hay respuesta final. Hoy está en desuso.',
      en: 'WebDAV: the request is still being processed and there is no final answer yet. Deprecated today.',
    },
    ref: 'RFC 2518',
  },
  {
    code: 103,
    phrase: 'Early Hints',
    es: 'Pistas tempranas',
    desc: {
      es: 'Envía cabeceras Link por adelantado para que el navegador precargue recursos mientras se prepara la respuesta.',
      en: 'Sends Link headers early so the browser can preload resources while the response is being prepared.',
    },
    ref: 'RFC 8297',
  },
  {
    code: 200,
    phrase: 'OK',
    es: 'Correcto',
    desc: {
      es: 'La petición ha ido bien y la respuesta lleva el resultado.',
      en: 'The request succeeded and the response carries the result.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 201,
    phrase: 'Created',
    es: 'Creado',
    desc: {
      es: 'Se ha creado un recurso nuevo. La cabecera Location suele indicar su URL.',
      en: 'A new resource was created. The Location header usually gives its URL.',
    },
    when: { es: 'Tras un POST que crea algo.', en: 'After a POST that creates something.' },
    ref: 'RFC 9110',
  },
  {
    code: 202,
    phrase: 'Accepted',
    es: 'Aceptado',
    desc: {
      es: 'La petición se ha aceptado, pero se procesará más tarde.',
      en: 'The request was accepted but will be processed later.',
    },
    when: { es: 'Trabajos en cola o asíncronos.', en: 'Queued or asynchronous jobs.' },
    ref: 'RFC 9110',
  },
  {
    code: 203,
    phrase: 'Non-Authoritative Information',
    es: 'Información no autorizada',
    desc: {
      es: 'Correcto, pero un proxy ha modificado la respuesta del servidor original.',
      en: 'Success, but a proxy has changed the origin server response.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 204,
    phrase: 'No Content',
    es: 'Sin contenido',
    desc: {
      es: 'Correcto y sin cuerpo en la respuesta.',
      en: 'Success, with no body in the response.',
    },
    when: {
      es: 'Un DELETE o un PUT que no necesita devolver nada.',
      en: 'A DELETE or PUT that does not need to return anything.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 205,
    phrase: 'Reset Content',
    es: 'Restablecer contenido',
    desc: {
      es: 'Correcto; el cliente debe vaciar el formulario o la vista que envió la petición.',
      en: 'Success; the client should reset the form or view that sent the request.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 206,
    phrase: 'Partial Content',
    es: 'Contenido parcial',
    desc: {
      es: 'Devuelve solo el trozo pedido con la cabecera Range.',
      en: 'Returns only the part requested with the Range header.',
    },
    when: {
      es: 'Reanudar descargas y hacer streaming de vídeo.',
      en: 'Resuming downloads and video streaming.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 207,
    phrase: 'Multi-Status',
    es: 'Estado múltiple',
    desc: {
      es: 'WebDAV: el cuerpo XML lleva un estado distinto para cada recurso afectado.',
      en: 'WebDAV: the XML body carries a separate status for each resource involved.',
    },
    ref: 'RFC 4918',
  },
  {
    code: 208,
    phrase: 'Already Reported',
    es: 'Ya informado',
    desc: {
      es: 'WebDAV: este recurso ya apareció antes en la misma respuesta 207.',
      en: 'WebDAV: this resource was already listed earlier in the same 207 response.',
    },
    ref: 'RFC 5842',
  },
  {
    code: 226,
    phrase: 'IM Used',
    es: 'IM usada',
    desc: {
      es: 'La respuesta es el resultado de aplicar una transformación (delta encoding) al recurso.',
      en: 'The response is the result of applying an instance manipulation (delta encoding) to the resource.',
    },
    ref: 'RFC 3229',
  },
  {
    code: 300,
    phrase: 'Multiple Choices',
    es: 'Varias opciones',
    desc: {
      es: 'El recurso tiene varias representaciones y el cliente puede elegir una.',
      en: 'The resource has several representations and the client may choose one.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 301,
    phrase: 'Moved Permanently',
    es: 'Movido permanentemente',
    desc: {
      es: 'El recurso tiene una URL nueva para siempre, indicada en Location. Los buscadores trasladan el posicionamiento.',
      en: 'The resource has a new permanent URL, given in Location. Search engines carry the ranking over.',
    },
    when: {
      es: 'Cambios de dominio o de estructura de URL. Algunos clientes cambian POST por GET: si importa, usa 308.',
      en: 'Domain or URL structure changes. Some clients turn POST into GET: if that matters, use 308.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 302,
    phrase: 'Found',
    es: 'Encontrado',
    desc: {
      es: 'El recurso está temporalmente en otra URL, indicada en Location.',
      en: 'The resource is temporarily at another URL, given in Location.',
    },
    when: {
      es: 'Redirecciones temporales. Para conservar el método, usa 307.',
      en: 'Temporary redirects. To keep the method, use 307.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 303,
    phrase: 'See Other',
    es: 'Ver otro',
    desc: {
      es: 'El resultado está en otra URL que hay que pedir con GET.',
      en: 'The result is at another URL that must be fetched with GET.',
    },
    when: {
      es: 'Después de enviar un formulario (patrón POST/redirect/GET).',
      en: 'After a form submission (POST/redirect/GET pattern).',
    },
    ref: 'RFC 9110',
  },
  {
    code: 304,
    phrase: 'Not Modified',
    es: 'No modificado',
    desc: {
      es: 'El recurso no ha cambiado desde la copia en caché del cliente, así que no se reenvía.',
      en: 'The resource has not changed since the client cached copy, so it is not sent again.',
    },
    when: {
      es: 'Respuesta a If-None-Match o If-Modified-Since.',
      en: 'Reply to If-None-Match or If-Modified-Since.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 305,
    phrase: 'Use Proxy',
    es: 'Usar proxy',
    desc: {
      es: 'Obsoleto: pedía repetir la petición a través de un proxy. Los navegadores lo ignoran por seguridad.',
      en: 'Obsolete: asked to repeat the request through a proxy. Browsers ignore it for security reasons.',
    },
    ref: 'RFC 9110',
    note: 'historic',
  },
  {
    code: 306,
    phrase: '(Unused)',
    es: 'Sin uso',
    desc: {
      es: 'Se usó en un borrador antiguo («Switch Proxy») y hoy está reservado.',
      en: 'Used in an old draft (“Switch Proxy”) and reserved today.',
    },
    ref: 'RFC 9110',
    note: 'unused',
  },
  {
    code: 307,
    phrase: 'Temporary Redirect',
    es: 'Redirección temporal',
    desc: {
      es: 'Como 302, pero el cliente debe repetir la petición con el mismo método y cuerpo.',
      en: 'Like 302, but the client must repeat the request with the same method and body.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 308,
    phrase: 'Permanent Redirect',
    es: 'Redirección permanente',
    desc: {
      es: 'Como 301, pero conservando el método y el cuerpo.',
      en: 'Like 301, but keeping the method and the body.',
    },
    when: { es: 'Mover una API de forma permanente.', en: 'Moving an API for good.' },
    ref: 'RFC 9110',
  },
  {
    code: 400,
    phrase: 'Bad Request',
    es: 'Petición incorrecta',
    desc: {
      es: 'La petición está mal formada: sintaxis, parámetros o cuerpo no válidos.',
      en: 'The request is malformed: invalid syntax, parameters or body.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 401,
    phrase: 'Unauthorized',
    es: 'No autenticado',
    desc: {
      es: 'Falta autenticarse o las credenciales no valen. Debe ir con una cabecera WWW-Authenticate.',
      en: 'Authentication is missing or the credentials are wrong. It must come with a WWW-Authenticate header.',
    },
    when: {
      es: 'Sin sesión o con un token caducado. Si está autenticado pero no tiene permiso, es 403.',
      en: 'No session or an expired token. If the user is authenticated but not allowed, use 403.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 402,
    phrase: 'Payment Required',
    es: 'Pago requerido',
    desc: {
      es: 'Reservado para usos futuros de pago. Algunas API lo usan cuando se acaba el saldo o la suscripción.',
      en: 'Reserved for future payment use. Some APIs use it when credit or a subscription runs out.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 403,
    phrase: 'Forbidden',
    es: 'Prohibido',
    desc: {
      es: 'El servidor entiende la petición pero se niega a atenderla. Volver a autenticarse no cambia nada.',
      en: 'The server understands the request but refuses it. Authenticating again will not help.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 404,
    phrase: 'Not Found',
    es: 'No encontrado',
    desc: {
      es: 'No existe nada en esa URL, o el servidor prefiere no decir que existe.',
      en: 'There is nothing at that URL, or the server would rather not say it exists.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 405,
    phrase: 'Method Not Allowed',
    es: 'Método no permitido',
    desc: {
      es: 'El recurso existe pero no admite ese método. La cabecera Allow lista los que sí.',
      en: 'The resource exists but does not accept that method. The Allow header lists the ones it does.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 406,
    phrase: 'Not Acceptable',
    es: 'No aceptable',
    desc: {
      es: 'No hay ninguna representación que encaje con las cabeceras Accept del cliente.',
      en: 'No representation matches the client Accept headers.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 407,
    phrase: 'Proxy Authentication Required',
    es: 'Autenticación de proxy requerida',
    desc: {
      es: 'Como 401, pero es el proxy el que pide credenciales.',
      en: 'Like 401, but the proxy is the one asking for credentials.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 408,
    phrase: 'Request Timeout',
    es: 'Tiempo de espera agotado',
    desc: {
      es: 'El cliente tardó demasiado en enviar la petición completa y el servidor cerró la conexión.',
      en: 'The client took too long to send the full request and the server closed the connection.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 409,
    phrase: 'Conflict',
    es: 'Conflicto',
    desc: {
      es: 'La petición choca con el estado actual del recurso.',
      en: 'The request conflicts with the current state of the resource.',
    },
    when: {
      es: 'Ediciones simultáneas o un nombre de usuario ya ocupado.',
      en: 'Concurrent edits or a username that is already taken.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 410,
    phrase: 'Gone',
    es: 'Ya no existe',
    desc: {
      es: 'El recurso existía y se ha borrado para siempre, sin dirección nueva.',
      en: 'The resource existed and has been removed for good, with no new address.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 411,
    phrase: 'Length Required',
    es: 'Longitud requerida',
    desc: {
      es: 'El servidor exige la cabecera Content-Length.',
      en: 'The server requires a Content-Length header.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 412,
    phrase: 'Precondition Failed',
    es: 'Precondición fallida',
    desc: {
      es: 'No se cumple una condición de la petición, como If-Match con un ETag antiguo.',
      en: 'A condition in the request is not met, such as If-Match with an old ETag.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 413,
    phrase: 'Content Too Large',
    es: 'Contenido demasiado grande',
    desc: {
      es: 'El cuerpo supera el tamaño que acepta el servidor. Antes se llamaba Payload Too Large.',
      en: 'The body is larger than the server accepts. It used to be called Payload Too Large.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 414,
    phrase: 'URI Too Long',
    es: 'URI demasiado larga',
    desc: {
      es: 'La URL es más larga de lo que el servidor puede procesar.',
      en: 'The URL is longer than the server can process.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 415,
    phrase: 'Unsupported Media Type',
    es: 'Tipo de contenido no admitido',
    desc: {
      es: 'El servidor no acepta el formato del cuerpo (Content-Type o Content-Encoding).',
      en: 'The server does not accept the body format (Content-Type or Content-Encoding).',
    },
    ref: 'RFC 9110',
  },
  {
    code: 416,
    phrase: 'Range Not Satisfiable',
    es: 'Rango no satisfactorio',
    desc: {
      es: 'El rango pedido con Range queda fuera del tamaño del recurso.',
      en: 'The range asked for with Range falls outside the resource size.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 417,
    phrase: 'Expectation Failed',
    es: 'Expectativa fallida',
    desc: {
      es: 'El servidor no puede cumplir lo que pide la cabecera Expect.',
      en: 'The server cannot meet what the Expect header asks for.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 418,
    phrase: "I'm a teapot",
    es: 'Soy una tetera',
    desc: {
      es: 'Una broma del Día de los Inocentes de 1998: una tetera se niega a hacer café. RFC 9110 lo reserva para que nadie lo reutilice.',
      en: 'An April Fools joke from 1998: a teapot refuses to brew coffee. RFC 9110 reserves it so nobody reuses it.',
    },
    ref: 'RFC 2324',
    note: 'joke',
  },
  {
    code: 421,
    phrase: 'Misdirected Request',
    es: 'Petición mal dirigida',
    desc: {
      es: 'La petición llegó a un servidor que no puede responder por ese dominio, por ejemplo al reutilizar una conexión HTTP/2.',
      en: 'The request reached a server that cannot answer for that host, for example when reusing an HTTP/2 connection.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 422,
    phrase: 'Unprocessable Content',
    es: 'Contenido no procesable',
    desc: {
      es: 'La sintaxis es correcta, pero los datos no pasan la validación.',
      en: 'The syntax is fine, but the data fails validation.',
    },
    when: {
      es: 'Errores de validación en una API (un email vacío, una fecha imposible).',
      en: 'Validation errors in an API (an empty email, an impossible date).',
    },
    ref: 'RFC 9110',
  },
  {
    code: 423,
    phrase: 'Locked',
    es: 'Bloqueado',
    desc: {
      es: 'WebDAV: el recurso está bloqueado por otro cliente.',
      en: 'WebDAV: the resource is locked by another client.',
    },
    ref: 'RFC 4918',
  },
  {
    code: 424,
    phrase: 'Failed Dependency',
    es: 'Dependencia fallida',
    desc: {
      es: 'WebDAV: la acción falló porque falló otra de la que dependía.',
      en: 'WebDAV: the action failed because another one it depended on failed.',
    },
    ref: 'RFC 4918',
  },
  {
    code: 425,
    phrase: 'Too Early',
    es: 'Demasiado pronto',
    desc: {
      es: 'El servidor no quiere procesar una petición enviada en los datos tempranos de TLS 1.3, porque podría repetirse.',
      en: 'The server will not process a request sent in TLS 1.3 early data, because it could be replayed.',
    },
    ref: 'RFC 8470',
  },
  {
    code: 426,
    phrase: 'Upgrade Required',
    es: 'Actualización requerida',
    desc: {
      es: 'Hay que cambiar a otro protocolo, indicado en la cabecera Upgrade.',
      en: 'The client must switch to another protocol, given in the Upgrade header.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 428,
    phrase: 'Precondition Required',
    es: 'Precondición requerida',
    desc: {
      es: 'El servidor exige peticiones condicionales (If-Match) para evitar que se pisen cambios.',
      en: 'The server requires conditional requests (If-Match) so changes are not overwritten.',
    },
    ref: 'RFC 6585',
  },
  {
    code: 429,
    phrase: 'Too Many Requests',
    es: 'Demasiadas peticiones',
    desc: {
      es: 'El cliente ha superado el límite de peticiones. Retry-After indica cuánto esperar.',
      en: 'The client went over the rate limit. Retry-After says how long to wait.',
    },
    when: { es: 'Limitación de uso de una API.', en: 'API rate limiting.' },
    ref: 'RFC 6585',
  },
  {
    code: 431,
    phrase: 'Request Header Fields Too Large',
    es: 'Cabeceras demasiado grandes',
    desc: {
      es: 'Las cabeceras, o una de ellas, son demasiado grandes. Suele pasar con cookies enormes.',
      en: 'The headers, or one of them, are too large. It often happens with huge cookies.',
    },
    ref: 'RFC 6585',
  },
  {
    code: 451,
    phrase: 'Unavailable For Legal Reasons',
    es: 'No disponible por razones legales',
    desc: {
      es: 'El recurso no se sirve por una orden legal, como una censura o una demanda. El número homenajea a Fahrenheit 451.',
      en: 'The resource is withheld because of a legal demand, such as censorship or a lawsuit. The number nods to Fahrenheit 451.',
    },
    ref: 'RFC 7725',
  },
  {
    code: 500,
    phrase: 'Internal Server Error',
    es: 'Error interno del servidor',
    desc: {
      es: 'Algo ha fallado en el servidor y no hay un código más concreto.',
      en: 'Something failed on the server and there is no more specific code.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 501,
    phrase: 'Not Implemented',
    es: 'No implementado',
    desc: {
      es: 'El servidor no admite la funcionalidad necesaria, por ejemplo un método que no conoce.',
      en: 'The server does not support the functionality needed, for example a method it does not know.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 502,
    phrase: 'Bad Gateway',
    es: 'Puerta de enlace incorrecta',
    desc: {
      es: 'Un proxy o pasarela recibió una respuesta no válida del servidor de detrás.',
      en: 'A proxy or gateway got an invalid response from the server behind it.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 503,
    phrase: 'Service Unavailable',
    es: 'Servicio no disponible',
    desc: {
      es: 'El servidor no puede atender ahora, por sobrecarga o mantenimiento. Retry-After puede indicar cuándo volver.',
      en: 'The server cannot handle the request right now, because of overload or maintenance. Retry-After may say when to come back.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 504,
    phrase: 'Gateway Timeout',
    es: 'Tiempo de espera de la pasarela agotado',
    desc: {
      es: 'Un proxy o pasarela no recibió respuesta a tiempo del servidor de detrás.',
      en: 'A proxy or gateway did not get a timely response from the server behind it.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 505,
    phrase: 'HTTP Version Not Supported',
    es: 'Versión de HTTP no admitida',
    desc: {
      es: 'El servidor no admite la versión de HTTP de la petición.',
      en: 'The server does not support the HTTP version of the request.',
    },
    ref: 'RFC 9110',
  },
  {
    code: 506,
    phrase: 'Variant Also Negotiates',
    es: 'La variante también negocia',
    desc: {
      es: 'Error de configuración en la negociación de contenido: la variante elegida vuelve a negociar.',
      en: 'Content negotiation misconfiguration: the chosen variant negotiates again.',
    },
    ref: 'RFC 2295',
  },
  {
    code: 507,
    phrase: 'Insufficient Storage',
    es: 'Almacenamiento insuficiente',
    desc: {
      es: 'WebDAV: el servidor no tiene espacio para guardar lo que se pide.',
      en: 'WebDAV: the server has no room to store what is asked.',
    },
    ref: 'RFC 4918',
  },
  {
    code: 508,
    phrase: 'Loop Detected',
    es: 'Bucle detectado',
    desc: {
      es: 'WebDAV: el servidor encontró un bucle infinito al procesar la petición.',
      en: 'WebDAV: the server found an infinite loop while processing the request.',
    },
    ref: 'RFC 5842',
  },
  {
    code: 510,
    phrase: 'Not Extended',
    es: 'No extendido',
    desc: {
      es: 'Histórico: la petición necesitaba extensiones que el servidor no admite.',
      en: 'Historic: the request needed extensions the server does not support.',
    },
    ref: 'RFC 2774',
    note: 'historic',
  },
  {
    code: 511,
    phrase: 'Network Authentication Required',
    es: 'Autenticación de red requerida',
    desc: {
      es: 'Hay que iniciar sesión en la red para salir a internet, como en el wifi de un hotel o un aeropuerto.',
      en: 'You must log in to the network to reach the internet, as on hotel or airport WiFi.',
    },
    ref: 'RFC 6585',
  },
];

/** Lowercase, without accents: "Categoría" and "categoria" match. */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** By code prefix ("40" → 400–409) or by text in both languages. */
export function searchCodes(query: string, group: Group = 'all'): StatusCode[] {
  const q = normalize(query.trim());
  const inGroup = CODES.filter((c) => group === 'all' || String(c.code)[0] === group);
  if (!q) return inGroup;
  if (/^\d{1,3}$/.test(q)) return inGroup.filter((c) => String(c.code).startsWith(q));
  return inGroup.filter((c) =>
    [c.phrase, c.es, c.desc.es, c.desc.en, c.when?.es ?? '', c.when?.en ?? '', c.ref].some((t) =>
      normalize(t).includes(q),
    ),
  );
}

/** "#404" in the URL → 404, when that code is in the table. */
export function codeFromHash(hash: string): number | null {
  const m = /^#(\d{3})$/.exec(hash);
  if (!m) return null;
  const code = Number(m[1]);
  return CODES.some((c) => c.code === code) ? code : null;
}
