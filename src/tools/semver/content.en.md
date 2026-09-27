## How it works

Type a version range like the ones in `package.json` and, below it, the versions you want to check, one per line. The tool uses `semver`, the same library as npm, so the result matches what `npm install` would pick. Each version is marked as satisfying the range or not, and you will see the highest one that fits and the lowest version the range allows.

The range is also shown **normalised** (`^1.2.3` → `>=1.2.3 <2.0.0-0`) and explained in words. The trailing `-0` means the upper bound also leaves out prereleases of that version, such as `2.0.0-beta`.

## Prereleases

By default npm keeps a prerelease (`1.3.0-rc.1`) out of a range unless the range names a prerelease of that same version. It protects you from installing betas by accident. With “Include prereleases” on, they are checked like any other version.
