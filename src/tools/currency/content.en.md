## How it works

Type an amount, pick the source and target currencies, and the result appears right away, with the unit rate both ways ("1 USD = 0.909091 EUR") and the same amount in every available currency. The swap button flips the pair.

The rates are the **European Central Bank reference rates**, published once per working day around 16:00 (Madrid time) for about 30 currencies. The tool downloads the whole table from `api.frankfurter.dev`, with no parameters, and converts in your browser: neither the amount nor the currencies you pick leave your device.

## Offline

The last downloaded table is kept in your browser with its date. With no connection, that table is used and the tool tells you which day it is from. It is downloaded again after 6 hours.

Reference rates are not what a bank, a card or an exchange office will charge you: they add their own margin and sometimes a fee. Use them as a guide or for internal calculations.
