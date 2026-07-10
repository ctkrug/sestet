const COOKIE_NAME = "swl_id";

// A random, unaccountable per-browser id — not a login, just enough to stop
// one browser from submitting twice or voting twice on the same entry.
export function getOrCreateVisitorToken(cookieHeader: string | null): { token: string; isNew: boolean } {
  const existing = parseCookie(cookieHeader, COOKIE_NAME);
  if (existing) return { token: existing, isNew: false };
  return { token: crypto.randomUUID(), isNew: true };
}

export function visitorCookieHeader(token: string): string {
  const oneYear = 60 * 60 * 24 * 365;
  return `${COOKIE_NAME}=${token}; Max-Age=${oneYear}; Path=/; SameSite=Lax; Secure; HttpOnly`;
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}
