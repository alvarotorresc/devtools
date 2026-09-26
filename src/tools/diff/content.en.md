## How it works

Paste the original text on the left and the modified one on the right. The tool finds the longest common subsequence of lines and marks as removed (−) the lines only in the original and as added (+) the lines only in the modified text. When a line changes, it also highlights the exact words that differ, so you do not have to hunt for them.

The **unified view** lists changes one under another, like `git diff`. The **side-by-side view** puts each version in its own column. With "Changes only", long unchanged stretches are hidden and three lines of context are kept around each difference.

## Options

"Ignore spaces" treats lines that only differ in spaces, tabs or trailing spaces as equal; "Ignore case" does the same with capital letters. They help when comparing reformatted code or lists copied from different places. The counter in the header sums up how many lines were added and removed, and "Copy diff" copies the result as plain text.
