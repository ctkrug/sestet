import type { Entry } from "@/types";

export interface WallEntry extends Entry {
  justArrived: boolean;
}

// Diffs a fresh poll response against the set of entry ids already rendered
// so newly-appeared entries (from other visitors) can get the "just
// arrived" glow, without re-triggering it for entries the wall already
// showed on a prior poll.
export function annotateArrivals(
  entries: readonly Entry[],
  seenIds: ReadonlySet<string>,
): { entries: WallEntry[]; seenIds: Set<string> } {
  const nextSeen = new Set(seenIds);
  const annotated = entries.map((entry) => {
    const justArrived = !seenIds.has(entry.id);
    nextSeen.add(entry.id);
    return { ...entry, justArrived };
  });
  return { entries: annotated, seenIds: nextSeen };
}

export function seedSeenIds(entries: readonly Entry[]): Set<string> {
  return new Set(entries.map((entry) => entry.id));
}
