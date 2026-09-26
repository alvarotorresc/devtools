## The first two digits

In Spain the first two digits of a postal code are the province code, the same one the INE uses: 28 is Madrid, 08 Barcelona, 46 Valencia and 52 Melilla. So the postal code alone tells you the province, the autonomous region and the capital, though not the town. Paste a column of codes and each line shows its province; you can copy them all normalized.

## The lost zero

Spreadsheets treat `08001` as a number and store it as `8001`. The tool recognises 4-digit codes, adds the leading 0 back and tells you, so you can fix the source column. Prefixes 00 and 53 to 99 do not exist and are flagged as errors.

With “Look up by province” you see the range of codes for each one (28000 to 28999 in Madrid). Finding the exact town for a code would need the Correos database, which is not included.
