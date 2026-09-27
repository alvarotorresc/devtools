## How it works

The User-Agent is the text a browser introduces itself with on every request: `Mozilla/5.0 (Windows NT 10.0; …) Firefox/128.0`. When the tool opens it is filled with your browser's own; you can also paste one from a server log or a bug report. It is parsed with `ua-parser-js`, a pattern database that is updated often, and you get the browser and its version, the engine, the operating system, the device (vendor, model and type) and the CPU architecture.

If the text contains words such as `bot`, `crawler` or `spider`, you are told it looks like a crawler. Desktop browsers rarely state a device type, so in that case it shows “Desktop (likely)”.

## Frozen User-Agent and Client Hints

Since 2021 Chrome, Edge and other Chromium-based browsers freeze part of the User-Agent to reduce tracking: the minor version is always zero and Windows 11 shows up as Windows 10. Precise data is requested separately through **Client Hints**. When you analyse your own browser's User-Agent, the tool adds the low-entropy ones: brands, platform and whether it is a mobile device.
