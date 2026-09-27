## What it checks

A CIF (the tax ID of a Spanish company or entity) has three parts: a letter for the legal form (B for a limited company, A for a public limited company, G for an association…), seven digits and a check character. The check comes from the seven digits: the even positions are added, the odd ones are doubled and their digits added, and the complement to 10 of the total is the check. When the entity takes a letter, that digit is mapped through the table `JABCDEFGHI`.

Some entities always take a digit (A, B, E and H), others always a letter (N, P, Q, S and W) and the rest accept both. The validator is strict only where the official sources agree, and when it fails it tells you which check it expected and in which form.

## Tax IDs of people and test data

Tax IDs starting with K, L or M do not belong to companies but to people without a DNI (children under 14, Spaniards living abroad and foreigners without an NIE). They are checked with the DNI letter table and, being personal data, they are never stored in the browser even with “Remember what I type” on. The same happens if you paste a DNI or an NIE by mistake: as soon as one line looks like one, nothing you type is stored.

The Generate tab creates CIF numbers with the right check for the type you choose, handy for test invoices and forms. They are random: a valid CIF does not mean the company exists.
