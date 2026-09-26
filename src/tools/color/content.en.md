## How it works

Pick a color with the picker or type its value in any of the four formats: **HEX** (`#58a6ff`), **RGB**, **HSL** or **OKLCH**. All fields stay in sync: change one and the others update. Both modern CSS syntax (`rgb(88 166 255)`) and the classic comma syntax are accepted.

**OKLCH** describes a color by perceived lightness (L), chroma (C) and hue (H). Unlike HSL, two colors with the same L look equally light, which makes consistent palettes and accessible variants easier. Some OKLCH values fall outside what an sRGB screen can show; they are adjusted to the closest color and you are told.

## WCAG contrast

The tool computes the contrast of the color against white and black following WCAG 2.x. Normal text needs 4.5:1 (AA) or 7:1 (AAA); large text (24px, or 18.66px bold) needs 3:1 and 4.5:1. So you know right away whether a color works for text on a light or dark background.
