## How it works

Paste a full URL, the part after `?` or a JSON object. If the text starts with `{`, it goes from JSON to query string; otherwise from query string to JSON. You can also fix the direction. Each parameter is split at the first `=`, `+` is read as a space and `%XX` sequences are decoded. If a sequence is malformed it is left as it is, with a note.

Repeated keys (`b=2&b=3`) become a list. With **bracket notation**, the one PHP, Rails and the `qs` library use, `filter[price]=10` is read as an object and `tags[]=a&tags[]=b` as a list. Below it you get a table with every pair already decoded.

## From JSON to query string

The JSON must be an object. Values are encoded with `encodeURIComponent`, `null` becomes `key=`, lists become repeated keys or `[]` keys, and nested objects become `a[b]=1`. Keys that look like credentials (`token`, `password`, `api_key`, `session`…) keep the input from being saved in the browser.
