import { describe, expect, it } from "vitest";
import { annotateArrivals, seedSeenIds } from "@/lib/wall";
import type { Entry } from "@/types";

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: "e1",
    promptId: "2026-03-05",
    body: "six words that fill this slot",
    voteCount: 0,
    createdAt: 1,
    votedByMe: false,
    isMine: false,
    ...overrides,
  };
}

describe("seedSeenIds", () => {
  it("collects ids from the given entries", () => {
    const seen = seedSeenIds([makeEntry({ id: "e1" }), makeEntry({ id: "e2" })]);
    expect(seen).toEqual(new Set(["e1", "e2"]));
  });

  it("returns an empty set for an empty entry list", () => {
    expect(seedSeenIds([])).toEqual(new Set());
  });
});

describe("annotateArrivals", () => {
  it("marks nothing as arrived on the very first call when seeded from the same list", () => {
    const entries = [makeEntry({ id: "e1" }), makeEntry({ id: "e2" })];
    const seen = seedSeenIds(entries);
    const { entries: annotated } = annotateArrivals(entries, seen);
    expect(annotated.every((e) => !e.justArrived)).toBe(true);
  });

  it("marks a new entry as arrived while leaving previously-seen entries alone", () => {
    const seen = new Set(["e1"]);
    const { entries } = annotateArrivals([makeEntry({ id: "e1" }), makeEntry({ id: "e2" })], seen);
    expect(entries.find((e) => e.id === "e1")?.justArrived).toBe(false);
    expect(entries.find((e) => e.id === "e2")?.justArrived).toBe(true);
  });

  it("accumulates seen ids across calls so an entry is never marked arrived twice", () => {
    const first = annotateArrivals([makeEntry({ id: "e1" })], new Set());
    expect(first.entries[0]!.justArrived).toBe(true);

    const second = annotateArrivals([makeEntry({ id: "e1" })], first.seenIds);
    expect(second.entries[0]!.justArrived).toBe(false);
  });

  it("handles an empty entries array", () => {
    const { entries, seenIds } = annotateArrivals([], new Set(["e1"]));
    expect(entries).toEqual([]);
    expect(seenIds).toEqual(new Set(["e1"]));
  });
});
