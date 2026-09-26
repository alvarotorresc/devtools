## How it works

In HTML, the characters `<`, `>`, `&`, `"` and `'` have a meaning of their own. To show them as text you write them as entities: `&lt;`, `&gt;`, `&amp;`, `&quot;` and `&#39;`. That is the minimum for pasting a code snippet into a page or for keeping user text from being read as HTML.

The **Plus everything non-ASCII** mode also converts accents, symbols and emoji: it uses the entity name when there is one (`&eacute;`, `&euro;`, `&mdash;`) and the number otherwise (`&#128512;`). It helps with email templates or legacy systems that do not guarantee UTF-8.

## Decoding

When you paste text with entities, the tool detects it and decodes it: named entities, decimal (`&#233;`) and hexadecimal (`&#xE9;`) ones. It does it in a single pass, so `&amp;lt;` becomes `&lt;` and not `<`. Entities it does not know are left as they are. The result is always shown as text and never inserted into the page as HTML.
