## What they are for

When you build a payment form you need numbers that look like a real card: the right length for the brand, the right prefix (4 for Visa, 51–55 or 2221–2720 for Mastercard, 34 or 37 for American Express) and a last digit that satisfies the Luhn algorithm. This tool generates them at random, with an expiry date and CVV if you need them, and validates them: it tells you the brand, groups the number as printed on the card and warns when the length is unusual for that brand.

Gateways such as Stripe publish their own numbers for test mode, like `4242 4242 4242 4242`; they are listed under the generator. Use those when testing against their sandbox, because only they simulate accepted or declined payments.

## How Luhn works

Walk the number from right to left and double every second digit, starting with the second one; if the double is above 9, subtract 9. The number is valid when the total ends in 0. It catches any single mistyped digit and almost any swap of two neighbours, but it says nothing about whether the card exists. Neither what you type nor what you generate is stored in the browser.
