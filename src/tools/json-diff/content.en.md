## How it works

Paste the original JSON on the left and the modified one on the right. The tool parses both and compares their **structure**, not their text: key order, whitespace and whether a number is written `1` or `1.0` make no difference. Each difference comes with its path (`$.users[0].email`) and a symbol: `+` when the key is only in the modified document, `−` when it is only in the original and `~` when both have it with a different value.

At the top you get a summary (“2 added · 1 removed · 3 changed”) and a filter to see one kind of change. “Copy report” copies the list as text, one line per change, ready to paste into an issue or a code review.

## Lists and large documents

Lists are compared **position by position**: if you insert an item at the start, every item after it shows up as changed. The comparison walks the document without recursion, so it copes with JSON nested thousands of levels deep, and it lists up to 5000 changes.
