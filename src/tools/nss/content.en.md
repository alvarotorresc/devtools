## How it is built

The Spanish Social Security number (NSS or NAF) has 12 digits: 2 for the province where it was issued, 8 for the number and 2 for control. The province code is the same as in postal codes and the INE: 28 is Madrid and 08 is Barcelona. You will see it written with slashes (`28/12345678/40`), with spaces or all together, and the validator accepts any of them.

## The control formula

The control is the remainder of dividing by 97 a number made from the province and the number, but how they are joined depends on the size of the number. Below 10,000,000 it is `number + province × 10,000,000`; otherwise the province and the number are simply written one after the other. Many calculators only apply the second rule and reject correct numbers of the first kind: this tool applies both.

A province code outside 01–52 is not treated as an error, because some old or special numbers have one: it only shows a warning. The Generate tab creates valid numbers for the province you choose, to fill test forms. Nothing you type is stored: it is a personal identifier.
