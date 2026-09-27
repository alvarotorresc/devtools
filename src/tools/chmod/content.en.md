## How it works

Unix permissions have three representations and here they stay in sync: **octal** (`755`), **symbolic** (`rwxr-xr-x`, what `ls -l` shows) and the **checkboxes** for owner, group and others. Change any of them and the rest update. Below you get the `chmod` command in both forms, ready to copy, and a sentence that explains who can do what.

Each octal digit is the sum of read (4), write (2) and execute (1). The first digit is the owner's, the second the group's and the third everybody else's. With four digits, the first one holds the special bits: setuid (4), setgid (2) and sticky (1).

## Special bits and warnings

In symbolic form, setuid and setgid show up as `s` in the execute position (or `S` without execute), and sticky as `t` (or `T`). If other users can write, the tool warns you: any user on the system could modify the file. The quick buttons set the usual values: 644 for files, 755 for scripts and directories, and 600 or 700 for private files.
