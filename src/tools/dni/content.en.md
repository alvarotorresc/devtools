## How the letter is computed

The DNI letter is a check character: the 8-digit number is divided by 23 and the remainder is a position in the table `TRWAGMYFPDXBNJZSQVHLCKE`. For 12345678 the remainder is 14, so the letter is Z. A mistyped digit almost never keeps the same letter, which is why the validator catches a typo right away.

The NIE for foreign residents uses the same formula: its first letter becomes a digit (X is 0, Y is 1 and Z is 2) and the letter is computed over the resulting 8 digits. Tax IDs starting with K, L or M belong to people without a DNI and are checked in the CIF validator.

## Validate many at once and generate for testing

Paste a whole spreadsheet column, one per line. Each row says whether it is valid and, if not, what is wrong: the right letter, the missing digits or the NIE prefix. If a 7-digit DNI lost its leading zero, it is added back and the result says so.

The Generate tab creates DNI and NIE with the right letter to fill test forms or development databases. With a seed you always get the same list, which helps with reproducible tests. Nothing you type is stored: a DNI is personal data.
