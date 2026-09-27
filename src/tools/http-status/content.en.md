## How it works

Every HTTP response starts with a three-digit code that sums up what happened. The first digit gives the class: **1xx** informational, **2xx** success, **3xx** redirection, **4xx** client errors and **5xx** server errors. Here you have every code in the IANA registry with its official name, a short explanation, when it is worth using and the RFC that defines it.

Search by number (type `40` to see 400 to 409) or by words in English or Spanish, without worrying about accents. You can also filter by class and link straight to a code with `#404` at the end of the address.

## The ones people mix up

`401` is “I do not know who you are” and `403` is “I know who you are and you cannot come in”. `400` is a malformed request and `422` a well-formed request whose data fails validation. For redirects, `307` and `308` keep the method and body, while with `301` and `302` many clients turn a POST into a GET. `418` is a 1998 joke that RFC 9110 reserves so nobody reuses it.
