## Which identifier should you pick?

**UUID v4** is the classic: 122 random bits, no order. It works almost everywhere, but as a database primary key it fragments indexes because every value lands in a random place.

**UUID v7** stores the time in milliseconds in its first 48 bits, so new identifiers are ordered by time. It is today’s recommended choice for primary keys: it keeps UUID uniqueness while indexes grow at the end, like an auto-increment.

**ULID** follows the same idea as v7 in 26 base32 characters (without ambiguous letters such as I, L, O or U). It is shorter and easier to read in URLs and logs.

**NanoID** is a short, configurable random identifier: you choose the length and alphabet. With 21 URL-safe characters its collision probability is similar to a UUID v4.

## Validate

The Validate tab recognises UUIDs of any version (with or without dashes, upper or lower case), the nil and max UUIDs, and ULIDs. For v7 and ULID it shows the exact date the identifier was created.
