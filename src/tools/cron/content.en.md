## How it works

A cron expression has five space-separated fields: **minute** (0–59), **hour** (0–23), **day of month** (1–31), **month** (1–12 or `JAN`–`DEC`) and **day of week** (0–7, where 0 and 7 are Sunday, or `SUN`–`SAT`). Each field accepts `*` (every value), a value (`5`), a range (`1-5`), a list (`1,15`) and steps (`*/15`, `0-30/10`). The shortcuts `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly` and `@reboot` work too.

The tool explains the expression in words and works out the next run times in the time zone you pick, with the local date, how long until each run and the exact UTC time to copy.

## Day of month, day of week and clock changes

When both the day-of-month and day-of-week fields have a value, cron runs the job when **either** matches: `0 9 1 * 1` runs on day 1 and also every Monday. Clock changes follow Vixie cron, the one in almost every Linux distribution: a time that does not exist runs at the first valid minute after the jump, and a time that happens twice runs only the first time.
