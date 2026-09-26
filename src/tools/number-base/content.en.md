## How it works

Type a number in any field (binary, octal, decimal, hexadecimal or a custom base from 2 to 36) and the others update right away. The usual `0b`, `0o` and `0x` prefixes, a minus sign and `_` or space separators are accepted, so you can paste values straight from code.

Calculations use `BigInt`, so there is no size limit: a 64-bit number such as `18446744073709551616` or a key hundreds of digits long converts without losing precision, which fails with plain JavaScript numbers above 2^53.

## Grouping and bases

“Group digits” splits binary and hexadecimal into groups of 4 (one nibble each) and decimal and octal into groups of 3, so long values are easy to read. The custom base is handy for base 36, for example, which some URL shorteners and identifiers use. If you type a digit that does not exist in the base, the field tells you which digits are valid.
