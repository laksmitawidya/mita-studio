import { describe, expect, it } from "vitest";
import { DESK_TOP_Y, layoutWorkspace } from "./placement";
import { PRESETS } from "./presets";
import { DEFAULT_SETUP } from "./workspace";

const keys = (setup: typeof DEFAULT_SETUP) => layoutWorkspace(setup).map((p) => p.key);

describe("layoutWorkspace", () => {
  it("always places the desk and chair", () => {
    const empty = { ...DEFAULT_SETUP, monitorIds: [], accessoryIds: [] };
    expect(keys(empty)).toEqual(["desk", "chair"]);
  });

  it("puts every screen on the desk surface, centred as a row", () => {
    const setup = { ...DEFAULT_SETUP, monitorIds: ["24-full-hd-office-monitor-a24i-2026", "24-full-hd-office-monitor-a24i-2026"] };
    const monitors = layoutWorkspace(setup).filter((p) => p.model.kind === "monitor");
    expect(monitors).toHaveLength(2);
    expect(monitors.every((m) => m.position[1] === DESK_TOP_Y)).toBe(true);
    expect(monitors[0].position[0]).toBeCloseTo(-monitors[1].position[0]);
  });

  it("angles the outer screens inwards in a three-screen row", () => {
    const trader = PRESETS.find((p) => p.id === "trading")!.setup;
    const [left, centre, right] = layoutWorkspace(trader).filter((p) => p.model.kind === "monitor");
    expect(left.rotationY).toBeGreaterThan(0);
    expect(centre.rotationY).toBe(0);
    expect(right.rotationY).toBeLessThan(0);
  });

  it("keeps screens within the desk width", () => {
    for (const preset of PRESETS) {
      const placements = layoutWorkspace(preset.setup);
      const desk = placements[0].model;
      if (desk.kind !== "desk") throw new Error("first placement must be the desk");
      const half = desk.widthCm / 200;
      for (const m of placements.filter((p) => p.model.kind === "monitor")) {
        expect(Math.abs(m.position[0])).toBeLessThan(half);
      }
    }
  });

  it("sits the webcam on top of the centre screen", () => {
    const setup = { ...DEFAULT_SETUP, accessoryIds: ["logitech-4-k-webcam"] };
    const placements = layoutWorkspace(setup);
    const webcam = placements.find((p) => p.key === "webcam")!;
    const monitor = placements.find((p) => p.model.kind === "monitor")!;
    expect(webcam.position[0]).toBe(monitor.position[0]);
    expect(webcam.position[1]).toBeGreaterThan(DESK_TOP_Y + 0.3);
  });

  it("gives every placement a unique key", () => {
    for (const preset of PRESETS) {
      const k = keys(preset.setup);
      expect(new Set(k).size).toBe(k.length);
    }
  });
});
