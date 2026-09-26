## How it works

URLs only allow a limited set of characters. Everything else (spaces, accents, an `&` inside a value…) is written as `%` followed by two hex digits for each UTF-8 byte: a space is `%20` and an “é” is `%C3%A9`. This tool encodes and decodes as you type and detects the direction on its own: if the text already has `%XX` sequences, it decodes it.

There are two modes. **Component** (`encodeURIComponent`) also escapes `/ ? & = #`, and it is what you need for a parameter value. **Whole URL** (`encodeURI`) keeps those characters so the address structure stays intact. HTML forms send spaces as `+`; turn on “Read + as a space” to decode them.

## Parsing a URL

The **Parse URL** tab splits out the protocol, user, host, port (or the default one, 443 for HTTPS), path and fragment, and lists the query parameters already decoded, each with its own copy button. If you paste an address without `https://`, that scheme is assumed. It helps when checking campaign links full of `utm_` parameters, redirects or OAuth callbacks.
