## How to read a BIC

The BIC (or SWIFT code) identifies a bank in international transfers. It has 8 or 11 characters: 4 letters for the bank (`CAIX` is CaixaBank), 2 for the country (`ES`), 2 letters or digits for the location (`BB`) and, optionally, 3 for the branch. Without a branch, or with `XXX`, it means the head office, so `CAIXESBB` and `CAIXESBBXXX` are the same code.

The validator checks the shape and that the country is a current ISO 3166 code (plus Kosovo, `XK`, which SWIFT uses). When the location has a 0 as its second character, it warns that this is a test BIC, which cannot be used for real payments.

## What it does not do

It does not have the SWIFT directory, so it cannot tell which bank a code belongs to or whether it is registered: only whether its format is right. For a SEPA transfer inside the euro area the IBAN is usually enough; the BIC is still asked for in international payments outside it.
