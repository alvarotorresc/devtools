import type { Locale } from '../types';
import type { ErrorHint, Flag } from './logic';

export const strings = {
  es: {
    mode: 'Modo',
    pattern: 'Expresión',
    patternHelp: 'También puedes pegar un literal como /\\d+/gi.',
    patternPlaceholder: '(?<usuario>[\\w.]+)@(?<dominio>[\\w.]+)',
    flags: 'Flags',
    text: 'Texto de prueba',
    textPlaceholder: 'Escribe o pega el texto donde buscar',
    replacement: 'Reemplazo',
    replacementHelp: 'Usa $1, $<nombre> o $& para insertar lo capturado.',
    replacementPlaceholder: '$<dominio>: $<usuario>',
    matches: '{n} coincidencias',
    oneMatch: '1 coincidencia',
    noMatches: 'Sin coincidencias',
    truncated: 'Se muestran las primeras {n}.',
    invalid: 'Expresión no válida',
    empty: 'Escribe una expresión y un texto: las coincidencias se resaltan aquí.',
    paused: 'La última expresión tardó demasiado y se ha pausado. Edítala para volver a probar.',
    groups: 'Grupos',
    match: 'Coincidencia',
    position: 'Posición',
    undefinedGroup: '(sin valor)',
    replaced: '{n} reemplazos',
    oneReplacement: '1 reemplazo',
    output: 'Resultado',
    cheatsheet: 'Chuleta',
    copyMatches: 'Copiar coincidencias',
    genericError: 'La expresión no es válida. Revisa paréntesis, corchetes y barras invertidas.',
    technicalDetail: 'Detalle técnico',
  },
  en: {
    mode: 'Mode',
    pattern: 'Pattern',
    patternHelp: 'You can also paste a literal such as /\\d+/gi.',
    patternPlaceholder: '(?<user>[\\w.]+)@(?<domain>[\\w.]+)',
    flags: 'Flags',
    text: 'Test text',
    textPlaceholder: 'Type or paste the text to search',
    replacement: 'Replacement',
    replacementHelp: 'Use $1, $<name> or $& to insert what was captured.',
    replacementPlaceholder: '$<domain>: $<user>',
    matches: '{n} matches',
    oneMatch: '1 match',
    noMatches: 'No matches',
    truncated: 'Showing the first {n}.',
    invalid: 'Invalid pattern',
    empty: 'Type a pattern and some text: matches are highlighted here.',
    paused: 'The last expression took too long and was paused. Edit it to try again.',
    groups: 'Groups',
    match: 'Match',
    position: 'Position',
    undefinedGroup: '(no value)',
    replaced: '{n} replacements',
    oneReplacement: '1 replacement',
    output: 'Result',
    cheatsheet: 'Cheat sheet',
    copyMatches: 'Copy matches',
    genericError: 'The expression is not valid. Check parentheses, brackets and backslashes.',
    technicalDetail: 'Technical detail',
  },
} satisfies Record<Locale, Record<string, string>>;

export const flagNames: Record<Locale, Record<Flag, string>> = {
  es: {
    g: 'g · todas',
    i: 'i · sin mayúsculas',
    m: 'm · multilínea',
    s: 's · . incluye saltos',
    u: 'u · unicode',
    y: 'y · fija (sticky)',
  },
  en: {
    g: 'g · global',
    i: 'i · ignore case',
    m: 'm · multiline',
    s: 's · dot matches newlines',
    u: 'u · unicode',
    y: 'y · sticky',
  },
};

export const hints: Record<Locale, Record<ErrorHint, string>> = {
  es: {
    unterminatedGroup: 'Hay un «(» sin cerrar. Añade el «)» que falta o escápalo como \\(.',
    unmatchedParen: 'Sobra un «)». Quítalo o escápalo como \\).',
    nothingToRepeat:
      'Un cuantificador (*, +, ? o {n}) no tiene nada delante. Escápalo (\\*) si lo buscas literal.',
    unterminatedClass: 'Hay un «[» sin cerrar. Añade el «]» o escápalo como \\[.',
    groupName:
      'El nombre del grupo no es válido: debe empezar por una letra y no llevar espacios, como (?<año>…).',
    duplicateName: 'Dos grupos tienen el mismo nombre. Cambia uno de ellos.',
    quantifierOrder: 'En {n,m}, el primer número debe ser menor o igual que el segundo.',
    trailingBackslash: 'La expresión termina en «\\». Escápala como \\\\ o completa la secuencia.',
    invalidGroup: 'Tras «(?» debe ir :, =, !, <= , <! o <nombre>. Revisa ese grupo.',
    rangeOrder:
      'Un rango de caracteres está al revés, como [z-a]. Escríbelo de menor a mayor: [a-z].',
    loneBracket:
      'Con el flag u, «]», «{» y «}» sueltos no valen. Escápalos (\\]) o quita el flag u.',
    incompleteQuantifier:
      'Un «{» no forma un cuantificador completo como {2} o {2,5}. Ciérralo con «}» o escápalo como \\{.',
    invalidEscape:
      'Con el flag u, esa barra invertida no escapa nada válido (como \\a, o \\- fuera de […]). Quita la «\\» o quita el flag u.',
    invalidProperty:
      'Esa propiedad Unicode no existe. Usa un nombre válido, como \\p{L} (letras) o \\p{Script=Greek}.',
    invalidNamedRef:
      '\\k<nombre> apunta a un grupo que no existe. Crea el grupo (?<nombre>…) o corrige el nombre.',
    invalidClass:
      'Un rango de […] tiene una clase como \\d en un extremo, como [a-\\d]. Pon el guion al final ([a\\d-]) o escápalo (\\-).',
    flags: 'Hay un flag repetido o desconocido. Los válidos son g, i, m, s, u, v, y y d.',
  },
  en: {
    unterminatedGroup: 'There is an unclosed “(”. Add the missing “)” or escape it as \\(.',
    unmatchedParen: 'There is an extra “)”. Remove it or escape it as \\).',
    nothingToRepeat:
      'A quantifier (*, +, ? or {n}) has nothing before it. Escape it (\\*) to match it literally.',
    unterminatedClass: 'There is an unclosed “[”. Add the “]” or escape it as \\[.',
    groupName:
      'The group name is not valid: it must start with a letter and have no spaces, like (?<year>…).',
    duplicateName: 'Two groups share the same name. Rename one of them.',
    quantifierOrder: 'In {n,m}, the first number must be less than or equal to the second.',
    trailingBackslash: 'The pattern ends with “\\”. Escape it as \\\\ or finish the sequence.',
    invalidGroup: 'After “(?” you need :, =, !, <=, <! or <name>. Check that group.',
    rangeOrder: 'A character range is backwards, like [z-a]. Write it low to high: [a-z].',
    loneBracket:
      'With the u flag, a lone “]”, “{” or “}” is not allowed. Escape it (\\]) or drop the u flag.',
    incompleteQuantifier:
      'A “{” does not form a complete quantifier like {2} or {2,5}. Close it with “}” or escape it as \\{.',
    invalidEscape:
      'With the u flag, that backslash does not escape anything valid (like \\a, or \\- outside […]). Remove the “\\” or drop the u flag.',
    invalidProperty:
      'That Unicode property does not exist. Use a valid name, such as \\p{L} (letters) or \\p{Script=Greek}.',
    invalidNamedRef:
      '\\k<name> points to a group that does not exist. Add the group (?<name>…) or fix the name.',
    invalidClass:
      'A range inside […] has a class such as \\d at one end, like [a-\\d]. Put the hyphen last ([a\\d-]) or escape it (\\-).',
    flags: 'A flag is repeated or unknown. Valid ones are g, i, m, s, u, v, y and d.',
  },
};

export const cheatsheet: Record<Locale, [string, string][]> = {
  es: [
    ['.', 'Cualquier carácter salvo salto de línea'],
    ['\\d  \\w  \\s', 'Dígito, carácter de palabra, espacio'],
    ['\\D  \\W  \\S', 'Lo contrario de los anteriores'],
    ['[abc]  [^abc]  [a-z]', 'Uno de, ninguno de, rango'],
    ['^  $', 'Inicio y fin (de línea con el flag m)'],
    ['\\b', 'Límite de palabra'],
    ['*  +  ?', '0 o más, 1 o más, 0 o 1'],
    ['{3}  {2,5}  {2,}', 'Exactamente, entre, al menos'],
    ['*?  +?', 'Versión perezosa (lo mínimo posible)'],
    ['(…)  (?:…)', 'Grupo con captura y sin captura'],
    ['(?<nombre>…)', 'Grupo con nombre'],
    ['a|b', 'a o b'],
    ['(?=…)  (?!…)', 'Seguido de, no seguido de'],
    ['(?<=…)  (?<!…)', 'Precedido de, no precedido de'],
    ['\\1  \\k<nombre>', 'Repite lo capturado por un grupo'],
  ],
  en: [
    ['.', 'Any character except a line break'],
    ['\\d  \\w  \\s', 'Digit, word character, whitespace'],
    ['\\D  \\W  \\S', 'The opposite of the above'],
    ['[abc]  [^abc]  [a-z]', 'One of, none of, range'],
    ['^  $', 'Start and end (of line with the m flag)'],
    ['\\b', 'Word boundary'],
    ['*  +  ?', '0 or more, 1 or more, 0 or 1'],
    ['{3}  {2,5}  {2,}', 'Exactly, between, at least'],
    ['*?  +?', 'Lazy version (as few as possible)'],
    ['(…)  (?:…)', 'Capturing and non-capturing group'],
    ['(?<name>…)', 'Named group'],
    ['a|b', 'a or b'],
    ['(?=…)  (?!…)', 'Followed by, not followed by'],
    ['(?<=…)  (?<!…)', 'Preceded by, not preceded by'],
    ['\\1  \\k<name>', 'Repeats what a group captured'],
  ],
};
