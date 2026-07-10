// A minimal KVNamespace stand-in: enough of get/put for checkRateLimit.
// expirationTtl is recorded but not enforced (no test here depends on
// real expiry) — checkRateLimit's contract is what's under test.
export function createTestKv(): KVNamespace {
  const store = new Map<string, string>();
  return {
    async get(key: string) {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
  } as unknown as KVNamespace;
}
