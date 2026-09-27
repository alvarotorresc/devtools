## How it works

Type an IPv4 address with its prefix (`192.168.1.10/24`) or its mask (`192.168.1.10 255.255.255.0`). The tool works out the **network**, the **mask** and wildcard mask, the **broadcast** address, the first and last host, how many hosts are usable and how many addresses there are in total. It also shows the mask in binary, so you can see where the network part ends.

The network is the IP ANDed with the mask, and the broadcast sets every host bit to one. A normal network reserves its first and last addresses, so a `/24` has 254 usable hosts. `/31` networks are the exception (RFC 3021): they are used for point-to-point links, have no broadcast and both addresses are usable. A `/32` is a single host.

## Address type

You also see whether the IP is **private** (10/8, 172.16/12 and 192.168/16), CGNAT, loopback, link-local, documentation, multicast, reserved or public, and its historic class (A to E), which today is only informative. Leading zeros (`010`) are rejected because some systems read them as octal.
