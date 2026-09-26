## What a Unix timestamp is

A Unix timestamp (or _epoch time_) is the number of seconds since 1 January 1970 at 00:00 UTC. It is the usual way to store dates in databases, logs and APIs because it does not depend on the time zone. JavaScript, Java and many APIs use milliseconds instead of seconds, so the same instant can show up with 10 or with 13 digits.

## How it works

At the top you have the live Unix clock, in seconds and in milliseconds, each with its own copy button. When you type a timestamp, the tool detects whether it is in seconds or milliseconds and shows the date at once in ISO 8601, in UTC, in the time zone you choose (with its offset from UTC) and as relative time (“3 days ago”).

For the other direction, type a date such as `2026-09-26 14:30`. Without a zone (`Z` or `+02:00`) it is read in the chosen time zone, daylight saving time included. The default zone is your browser’s.
