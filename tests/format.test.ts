import { describe, expect, it } from "vitest";
import { timeAgo } from "@/lib/format";

describe("timeAgo", () => {
  it("returns 'just now' for anything under a minute", () => {
    expect(timeAgo(1000, 1000)).toBe("just now");
    expect(timeAgo(1000, 1000 + 59_000)).toBe("just now");
  });

  it("formats minutes", () => {
    expect(timeAgo(0, 5 * 60_000)).toBe("5m ago");
  });

  it("formats hours once past 60 minutes", () => {
    expect(timeAgo(0, 90 * 60_000)).toBe("1h ago");
  });

  it("formats days once past 24 hours", () => {
    expect(timeAgo(0, 26 * 60 * 60_000)).toBe("1d ago");
  });

  it("clamps a future createdAt (clock skew) to 'just now' instead of a negative value", () => {
    expect(timeAgo(5000, 1000)).toBe("just now");
  });
});
