## How it works

Paste a `curl` command and the tool turns it into a JavaScript `fetch` call as you type. It understands single and double quotes, `$'…'`, backslashes and commands split over several lines with `\`, just like bash. The quickest way is to copy the request from the browser's Network tab with “Copy as cURL (bash)”.

It translates the method (`-X`, `-I`, `-G`), headers (`-H`), body (`-d`, `--data-raw`, `--data-urlencode`, `--json`), forms (`-F`), basic authentication (`-u`), referer, cookies and maximum time (`-m`, with `AbortSignal.timeout`). If the body is JSON it is written with `JSON.stringify` so it is easy to edit. Anything that is already fetch's default, such as the GET method, is left out.

## What fetch cannot do

Some curl options have no browser equivalent: reading files from disk (`@file`), ignoring certificate errors (`-k`) or setting `User-Agent` and cookies by hand. In those cases a note explains what to do instead. For safety the command is never saved: cURL commands copied from the browser usually carry cookies and tokens.
