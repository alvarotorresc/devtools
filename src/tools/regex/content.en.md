## How it works

Type a regular expression and some test text: matches are highlighted right away and the table lists each one with its position and capture groups, named groups included (`(?<year>\d{4})`). Flags are switches; if you paste a literal such as `/\d+/gi`, the pattern and flags are split for you.

It runs on the browser’s JavaScript engine, so the result is exactly what you get in JS or TS code. Other languages (PCRE, Python, Java) share most of the syntax, but not all of it: JavaScript has no possessive quantifiers, for example.

## Replace and errors

The **Replace** tab lets you try a substitution with `$1`, `$<name>` or `$&` (the whole match) and see the resulting text and how many replacements were made. If the pattern has a syntax error, instead of the technical message you get what is wrong and how to fix it, such as an unclosed parenthesis or a backwards range. The engine's original message stays folded under “Technical detail”. The collapsible cheat sheet sums up the most common syntax.
