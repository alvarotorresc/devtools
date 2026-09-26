## How it works

A hash function turns any input into a fixed-length fingerprint. The same text always gives the same hash, and any change, however small, gives a completely different one. That is why hashes are used to check that a download is not corrupted or to detect changes.

The tool computes **MD5**, **SHA-1**, **SHA-256**, **SHA-384** and **SHA-512** at once as you type. SHA uses the browser's Web Crypto API; MD5 is not in that API, so it runs on a built-in implementation tested against the RFC 1321 test vectors. Text is encoded as UTF-8 before hashing, as `sha256sum` and most languages do.

## Comparing and files

Paste the hash you were given into "Compare with" (upper case, with spaces or colons, it does not matter) and the indicator tells you which algorithm it matches. In the **File** tab you can hash a file without uploading it anywhere.

MD5 and SHA-1 are no longer safe against attacks: use them to catch errors, not to sign anything or store passwords. For passwords, use a slow algorithm such as Argon2 or bcrypt.
