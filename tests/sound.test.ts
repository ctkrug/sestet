import { describe, expect, it } from "vitest";
import { getStoredMute, playSound, setStoredMute } from "@/lib/sound";

// The vitest environment is Node, so `window` is undefined here — this
// exercises exactly the guard paths the design standard requires ("guard
// for environments without it"), the same paths that protect SSR.
describe("sound in a non-browser environment", () => {
  it("getStoredMute defaults to false without throwing", () => {
    expect(getStoredMute()).toBe(false);
  });

  it("setStoredMute is a no-op without throwing", () => {
    expect(() => setStoredMute(true)).not.toThrow();
    expect(getStoredMute()).toBe(false);
  });

  it("playSound is a no-op without throwing for every sound name", () => {
    expect(() => playSound("submit")).not.toThrow();
    expect(() => playSound("vote")).not.toThrow();
    expect(() => playSound("arrival")).not.toThrow();
  });
});
