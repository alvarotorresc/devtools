## How it works

Choose what to encode: free **text**, a **URL** or the details of a **WiFi** network. The QR code is generated in your browser as you type, and you can download it as PNG (256, 512 or 1024 pixels) or as SVG, which scales without losing quality for print. It is always black on white, with its quiet zone, because that is what every camera reads well.

Text is encoded as UTF-8, so accents, ñ and emojis read correctly on any phone. If a URL has no `https://`, it is added and you are told. Error correction (L, M, Q or H) sets how much damage the code survives: more correction means a denser code and less room for text.

## WiFi QR codes

The WiFi tab builds the code phones recognise to join a network without typing the password: `WIFI:T:WPA;S:network;P:secret;;`. Special characters in the name and password are escaped as the format requires. The network name can be remembered in this browser, but **the password is never saved**.
