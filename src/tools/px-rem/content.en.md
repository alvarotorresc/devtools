## How it works

The three fields (px, rem and em) stay in sync: type in any of them and the other two update. `rem = px / base` and `em = px / parent`. The base size is the `font-size` of the `html` element, which is 16px in almost every browser; the parent size only affects em and, when left empty, equals the base.

Values always use a decimal point, because they are CSS values: what you copy works as is in your stylesheet. You can type a comma or a point.

## Why rem

A size in rem respects the font size the user picked in their browser; a size in px does not. That is why rem is the recommended unit for text, margins and spacing. The common sizes table gives the rem value from 10 to 64px for the current base, and the CSS snippet keeps the px value as a comment.
