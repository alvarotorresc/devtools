## How it works

Paste your data and pick the format to convert it to. The tool detects on its own whether the input is **JSON** (starts with `{` or `[` and is valid), **CSV** (the first line has commas, semicolons or tabs, and there are rows with the same number of columns) or **YAML**. You can also set the format by hand. The result updates as you type, ready to copy or download.

YAML is read in full, version 1.2: anchors and aliases (`&base`, `*base`), merge keys (`<<`), block text and several documents separated by `---`, which become a list. If there is an error you get its line and column.

## CSV

When reading CSV, quoted fields holding separators, line breaks and doubled quotes are respected. With “First row is the header” you get a list of objects; without it, a list of rows. Writing CSV needs a list of objects: the columns are every key that appears, nested objects are flattened as `address.city` and lists go into the cell as JSON. Keep in mind CSV does not store types: reading it back, everything is text unless you turn on “Detect numbers and booleans”.
