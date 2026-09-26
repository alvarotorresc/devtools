## What a JWT is

A JSON Web Token is three Base64url parts separated by dots: the **header** (algorithm and type), the **payload** (the data, or _claims_) and the **signature**. The first two are not encrypted, only encoded: anyone holding the token can read them. So a JWT should not carry anything the user must not see.

This tool decodes the header and payload as soon as you paste the token (a leading `Bearer ` is fine) and shows them formatted. Standard dates are converted to your local time and to relative time: `exp` (expires), `nbf` (not before) and `iat` (issued at). The indicator says whether the token is valid, expired or not valid yet.

## What it does not do

It does not verify the signature: that needs the issuer’s key, and it must happen on your server. A token that decodes fine can still be forged. It does not store anything either: the token is never written to browser storage and is gone when you close the page.
