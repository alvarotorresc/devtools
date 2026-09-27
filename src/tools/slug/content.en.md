## How it works

Type or paste one or more titles, one per line, and get their slug: the part of the URL that names a page, such as `my-first-post`. Accents and diaereses are removed (`á` → `a`, `ñ` → `n`), special letters are spelled with plain ones (`ß` → `ss`, `æ` → `ae`, `ø` → `o`) and everything that is not a letter or a digit, emojis included, becomes the separator.

With “& as and”, `Smith & Sons` gives `smith-and-sons` instead of `smith-sons`. You can pick the separator (`-`, `_` or `.`) and keep capital letters if your system tells them apart.

## Maximum length

Short slugs are easier to read and share. With a maximum length, the slug is cut at the last separator before the limit, without splitting words, unless the first word is already longer. If a text has no Latin letters at all (for example, 東京), the slug would be empty and you are told so.
