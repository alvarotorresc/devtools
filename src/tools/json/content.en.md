## How it works

Paste or type JSON and the tool parses it as you type. If it is valid, you get it formatted with the indentation you choose (2 spaces, 4 or tabs), or minified into a single line to send through an API or store in an environment variable.

If there is an error, the screen shows the exact line and column and prints that line with a marker under the failing character. The most common mistakes are trailing commas after the last item, single quotes and unquoted keys: standard JSON allows none of them.

## Sorting keys and exploring the tree

“Sort keys” orders the keys of every object alphabetically, including objects inside arrays. It helps when comparing two API responses with the diff tool.

The **Tree** tab shows the document as a collapsible structure. Each node lets you copy its path (for example `$.users[0].email`) or its value, which saves time when writing tests or `jq` queries.
