## How an IBAN is validated

An IBAN starts with a country code and two check digits, followed by the national account number (the BBAN). To check it, the first four characters are moved to the end, each letter becomes two digits (A = 10, B = 11… Z = 35) and the resulting number divided by 97 must leave a remainder of 1. The validator does that digit by digit, so it handles IBANs of up to 34 characters without losing precision, and before that it checks that the country uses IBAN and that the length is right for it: 24 in Spain, 27 in France, 22 in Germany.

## Spanish accounts: the CCC

In Spain the BBAN is the old CCC: bank (4 digits), branch (4), two check digits and account number (10). Those two digits have their own formula, with weights 1, 2, 4, 8, 5, 10, 9, 7, 3 and 6, and the validator checks it too: an IBAN can be consistent on the outside and still carry a wrong account. Paste a 20-digit CCC and you get its IBAN.

The Generate tab creates Spanish IBANs with real bank codes and random accounts, with every check digit right, to fill test forms. Neither what you type nor what you generate is stored in the browser: an account number is financial data.
