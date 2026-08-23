//apps/worker/src/url-guard.ts
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Server-Side Request Forgery protection. Fetching user-supplied URLs is the
// whole product, which also makes it the obvious way to aim this worker at
// things only our VPS can reach — Redis on localhost, an internal service, or
// the cloud metadata endpoint.

// Thrown only for policy violations, never for a site simply being
// unreachable. The consumer relies on that distinction: an unsafe URL must
// not be recorded as downtime.
export class UnsafeUrlError extends Error {}

const BLOCKED_HOSTNAMES = new Set(["localhost"]);

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);

  if (a === 0) return true; // "this network"
  if (a === 10) return true; // private
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT

  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const address = ip.toLowerCase();

  if (address === "::" || address === "::1") return true; // unspecified, loopback
  if (address.startsWith("fe80")) return true; // link-local
  if (address.startsWith("fc") || address.startsWith("fd")) return true; // unique local

  // IPv4-mapped addresses such as ::ffff:127.0.0.1
  const mapped = /^::ffff:(.+)$/.exec(address);
  if (mapped && isIP(mapped[1]) === 4) return isPrivateIPv4(mapped[1]);

  return false;
}

function isPrivateAddress(ip: string): boolean {
  const version = isIP(ip);

  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);

  return true; // unrecognised format: refuse rather than guess
}

// Throws UnsafeUrlError if the URL is not allowed. DNS failures are left to
// propagate as ordinary errors, because a domain that does not resolve means
// the site is genuinely down — not that it is unsafe.
export async function assertSafeUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError(`Invalid URL: ${rawUrl}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError(`Blocked protocol: ${url.protocol}`);
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, ""); // strip IPv6 brackets

  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) {
    throw new UnsafeUrlError(`Blocked hostname: ${hostname}`);
  }

  // Checking the hostname alone would be trivially bypassed by pointing a
  // domain at a private IP, so every address it actually resolves to is
  // validated.
  const addresses = isIP(hostname)
    ? [hostname]
    : (await lookup(hostname, { all: true })).map((entry) => entry.address);

  for (const address of addresses) {
    if (isPrivateAddress(address)) {
      throw new UnsafeUrlError(`Blocked address ${address} for host ${hostname}`);
    }
  }
}
