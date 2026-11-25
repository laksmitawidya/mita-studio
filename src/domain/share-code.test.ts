import { describe, expect, it } from "vitest";
import { PRESETS } from "./presets";
import { decodeSetup, encodeSetup, parsePlan } from "./share-code";
import { DEFAULT_SETUP } from "./workspace";

describe("share code", () => {
  it("encodes a setup compactly, collapsing repeated screens", () => {
    const setup = { ...DEFAULT_SETUP, monitorIds: ["27-4-k-multimedia-monitor", "27-4-k-multimedia-monitor"] };
    expect(encodeSetup(setup)).toBe("D2.C1.M27x2.LS.KB.MS");
  });

  it.each(PRESETS.map((p) => [p.id, p.setup] as const))("round-trips the %s preset", (_id, setup) => {
    expect(decodeSetup(encodeSetup(setup))).toEqual(setup);
  });

  it("is case-insensitive and ignores unknown tokens", () => {
    expect(decodeSetup("d1.c2.zz.m24.kb")).toEqual({
      deskId: "adjustable-wooden-desk",
      chairId: "concept-rattan-task-chair",
      monitorIds: ["24-full-hd-office-monitor-a24i-2026"],
      accessoryIds: ["logitech-mx-keyboard"],
    });
  });

  it("trims screens that a tampered link tries to squeeze onto a small desk", () => {
    expect(decodeSetup("D1.C1.M34x3")?.monitorIds).toEqual(["34-4-k-curved-monitor-180-hz"]);
  });

  it("returns null when nothing is recognisable", () => {
    expect(decodeSetup("")).toBeNull();
    expect(decodeSetup(null)).toBeNull();
    expect(decodeSetup("<script>")).toBeNull();
  });

  it("parses the plan with a weekly default", () => {
    expect(parsePlan("month")).toBe("month");
    expect(parsePlan("yearly")).toBe("week");
    expect(parsePlan(null)).toBe("week");
  });
});
