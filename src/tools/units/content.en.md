## How it works

Pick the quantity in the tabs (length, mass, temperature, volume, area, speed or data), type a value and choose its unit. Below you get that value in **every** unit of the tab, each one with its own copy button. You can use a decimal point or a comma (`1.5` or `1,5`) and a thousands separator (`1,000`).

The factors are exact by definition: an inch is 0.0254 m, a pound 0.45359237 kg and a US gallon 3.785411784 l. The result is rounded to 12 significant digits to remove floating-point noise (`0.1 + 0.2`), and very large or very small values switch to scientific notation.

## Temperature and data

Temperature is not converted with a factor but with a formula: °F = °C × 9/5 + 32 and K = °C + 273.15. That is why it is the only tab that accepts negative values, down to absolute zero (−273.15 °C).

The data tab mixes International System units (kB, MB, GB: powers of 1000) and binary units (KiB, MiB, GiB: powers of 1024). One GiB is 1073.741824 MB.
