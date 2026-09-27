## How it works

Type a size with its unit, like `1.5 GB`, `750 MiB` or `100 Mb`. A number with no unit is bytes. You immediately get the size in every **International System** unit (kB, MB, GB…, powers of 1000) and every **binary** unit (KiB, MiB, GiB…, powers of 1024), plus the exact bytes, the bits and the readable form in each system.

Case matters: `B` is a byte and `b` is a bit, so `100 Mb` (megabits, like your broadband speed) is 12.5 MB. `KB` with a capital K is read as the SI kB, but keep in mind that Windows writes KB, MB and GB while actually computing KiB, MiB and GiB.

## The 931 GB mystery

Drive makers use SI: 1 TB is 1,000,000,000,000 bytes. Windows divides by 1024 three times and shows about 931 "GB", which are 931 GiB. macOS and Linux usually use SI and show 1 TB. No space is missing: they are two ways of counting the same number of bytes.
