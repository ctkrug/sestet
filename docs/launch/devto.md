---
title: "Building Sestet: a daily six-word story game where the database does the refereeing"
published: false
tags: nextjs, cloudflare, sqlite, webdev
---

I built [Sestet](https://github.com/ctkrug/six-words-live), a tiny daily writing game.
Everyone who visits on a given day gets the same prompt, you write exactly six words against
it, and you land in a live wall of everyone else's take on the same six words. You upvote the
ones you like, and at midnight UTC the day freezes into an archive and a new prompt opens.

The writing UI was the easy part. The interesting problems were all about a bunch of anonymous
strangers hitting the same endpoints at the same time. Here are the two decisions I keep
thinking were the right calls.

## Let the database referee the races

The two rules that hold the whole thing together are "one entry per person per day" and "one
vote per person per entry." The naive way to enforce them is a read then a write: check whether
a row exists, and insert if it does not. Under any real concurrency that is a race. Two rapid
votes from the same person (a double-click, or a request the browser silently retried) can both
pass the "have you voted?" check before either one has written, and you have double counted.

So I pushed both rules into the schema instead of the application code. Entries get a unique
index on `(prompt_id, author_token)`. Votes use a composite primary key on
`(entry_id, voter_token)`. Then every write is a single `INSERT OR IGNORE`, and I read
`meta.changes` to find out whether my insert was the one that won:

```ts
const { meta } = await db
  .prepare("INSERT OR IGNORE INTO votes (entry_id, voter_token, created_at) VALUES (?, ?, ?)")
  .bind(entryId, voterToken, Date.now())
  .run();

if (meta.changes > 0) {
  await db.prepare("UPDATE entries SET vote_count = vote_count + 1 WHERE id = ?").bind(entryId).run();
}
```

Only one insert can ever succeed against that key, so only one vote can ever bump the count.
No transaction gymnastics, no advisory locks. The one wrinkle: `votes.entry_id` is a foreign
key, so voting for an id that does not exist throws a constraint error instead of quietly doing
nothing. I check the entry exists first and return `null` for the missing case, which the route
turns into a clean 404 rather than a 500. That exact path was a real crash I only caught by
poking the API with a made-up id.

## The live wall lies to you if you trust response order

The wall polls the entries endpoint every five seconds and also refetches when you flip between
"new" and "top." That means several requests can be in flight at once, and fetch responses do
not come back in the order you sent them. Click "top," then "new," and if the "top" response
happens to land second, the wall shows the wrong sort with the toggle pointing the other way.

The fix is a monotonic request id. Every fetch increments a counter and captures its own value;
when a response resolves, it only touches state if its id is still the latest one issued.

```ts
const requestId = ++entriesRequestIdRef.current;
const response = await fetch(`/api/entries?sort=${sortMode}`, { cache: "no-store" });
if (requestId !== entriesRequestIdRef.current) return; // a newer request already went out
```

It is a small pattern, but it is the difference between a wall that feels solid and one that
flickers into stale states whenever you click quickly. I ended up applying the same guard to
the prompt fetch and the midnight rollover path.

## What I would do differently

Polling every five seconds is fine for a wall this size, but it is not really "live," it is
"live-ish." If this got busy I would move to Cloudflare Durable Objects for a proper WebSocket
fan-out so entries push instantly instead of arriving on the next tick. I would also grow the
prompt bank. Right now it is a curated list mapped deterministically from the UTC day, which is
lovely because it needs no stored state, but the cycle is short enough that a daily regular
would eventually notice a repeat.

The stack is Next.js on the Cloudflare edge, D1 (SQLite) as the system of record, and KV for
rate limiting. Core logic sits at 100% line and branch coverage, tested against hand-written
in-memory stand-ins for D1 and KV so CI needs no native database.

Code and design notes: [github.com/ctkrug/six-words-live](https://github.com/ctkrug/six-words-live).
Give today's prompt a shot and tell me your six words.
