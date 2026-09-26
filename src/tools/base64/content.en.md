## How it works

Base64 writes binary data with 64 safe characters (letters, digits, `+` and `/`), so it can travel inside JSON, an email or a URL without breaking. Every 3 bytes become 4 characters, so the result is a third larger than the original.

Type text and it is encoded right away; paste Base64 and it is decoded. The tool detects the direction: it only decodes when the input is valid Base64 and the result is readable text, so a word like “hello” is encoded even though it only uses allowed letters. If it guesses wrong, set the direction by hand. Text is treated as UTF-8, so accents and emoji work.

## URL-safe and files

The URL-safe variant (RFC 4648) swaps `+` for `-` and `/` for `_` and drops the `=` padding. JWTs use it, and it is the one to use when Base64 goes inside a URL. Both variants are accepted when decoding.

In the **File** tab you can turn an image or a PDF into a data URI (`data:image/png;base64,…`) ready to paste into CSS or HTML, or go the other way: paste Base64 or a data URI and download the file. When the data URI does not say, the type is detected from the file header.
