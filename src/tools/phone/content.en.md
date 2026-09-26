## What it checks

Spanish phone numbers have 9 digits, and the first ones tell the type: mobiles start with 6 or 71–74, landlines with 8 or 9 followed by 1–8, freephone numbers with 800 or 900, special-rate numbers with 901 or 902 and premium-rate numbers with 803, 806, 807 or 905. The tool strips spaces, dots, dashes and brackets, recognises the country code in its three forms (`+34`, `0034` or `34` before 9 digits) and tells you the type of each number.

## E.164 and output formats

E.164 is the international format without spaces that SMS and WhatsApp APIs and `tel:` links expect: `+34612345678`. You also get the national format (`612 34 56 78`), the international one with spaces and a link to call. Paste a whole column of numbers, one per line, and copy them all normalized at once.

Short numbers such as 112 or 016 have no E.164 form and are flagged separately. Only Spanish numbers are validated; what you type is not stored, because a phone number is personal data.
