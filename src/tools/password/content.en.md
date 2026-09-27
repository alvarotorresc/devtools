## How it works

Choose the length, how many passwords you want and which character types to use: lowercase, uppercase, numbers and the 32 ASCII symbols. Every password includes at least one character of each active type; the rest are picked at random from all of them and then shuffled. The randomness comes from `crypto.getRandomValues`, the browser's cryptographic generator, with no bias when picking each character.

“Exclude look-alike characters” drops `0 O o 1 l I |`, which are easy to confuse when read aloud or copied by hand. A new password is generated whenever you change an option and every time you press “Generate”.

## Entropy

The strength meter uses entropy: length × log2(number of possible characters). 20 characters out of 94 give 131 bits. Below 50 bits is **weak**, up to 80 is **acceptable** and from there on it is **strong**. Making the password longer adds more than adding symbols. Passwords are never stored, not even in your browser; only the options are remembered.
