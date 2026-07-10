import { webcrypto } from "node:crypto";

// The edge runtime (and Node 20+, which CI runs on) expose `crypto` as a
// global; older local Node versions may not, which would otherwise fail
// any test that imports identity.ts.
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = webcrypto as Crypto;
}
