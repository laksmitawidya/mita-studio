import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETUP,
  addMonitor,
  fitsOnDesk,
  itemCount,
  lineItems,
  monitorRowWidthCm,
  normalizeSetup,
  removeOneMonitor,
  selectChair,
  selectDesk,
  toggleAccessory,
} from "./workspace";

const M24 = "24-full-hd-office-monitor-a24i-2026";
const M27 = "27-4-k-multimedia-monitor";
const M34 = "34-4-k-curved-monitor-180-hz";
const DESK_120 = "adjustable-wooden-desk";
const DESK_160 = "dual-motor-electric-standing-desk";

describe("monitor fit rules", () => {
  it("measures a row of screens, angling the outer two when there are three", () => {
    expect(monitorRowWidthCm([M24])).toBe(55);
    expect(monitorRowWidthCm([M24, M24])).toBe(110);
    expect(monitorRowWidthCm([M24, M27, M24])).toBeCloseTo(62 + 110 * 0.85);
  });

  it("fits two 24-inch screens on the 120 cm desk but not an ultrawide plus a 24-inch", () => {
    expect(fitsOnDesk(DESK_120, [M24, M24])).toBe(true);
    expect(fitsOnDesk(DESK_120, [M34, M24])).toBe(false);
  });

  it("never allows more than three screens", () => {
    expect(fitsOnDesk(DESK_160, [M24, M24, M24, M24])).toBe(false);
  });
});

describe("addMonitor", () => {
  it("adds a screen that fits", () => {
    const result = addMonitor(DEFAULT_SETUP, M24);
    expect(result.ok && result.value.monitorIds).toEqual([M27, M24]);
  });

  it("refuses a screen that doesn't fit and explains why", () => {
    const setup = { ...DEFAULT_SETUP, deskId: DESK_120, monitorIds: [M34] };
    const result = addMonitor(setup, M24);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/120 cm desk/);
  });

  it("refuses a fourth screen", () => {
    const setup = { ...DEFAULT_SETUP, deskId: DESK_160, monitorIds: [M24, M24, M24] };
    const result = addMonitor(setup, M24);
    expect(!result.ok && result.reason).toMatch(/maximum/);
  });

  it("rejects products from another category", () => {
    expect(addMonitor(DEFAULT_SETUP, DESK_120).ok).toBe(false);
  });
});

describe("selectDesk", () => {
  it("drops screens from the right when the new desk is narrower, and reports them", () => {
    const setup = { ...DEFAULT_SETUP, deskId: DESK_160, monitorIds: [M27, M27] };
    const result = selectDesk(setup, DESK_120);
    expect(result.ok && result.value.monitorIds).toEqual([M27]);
    expect(result.removed?.map((p) => p.id)).toEqual([M27]);
  });

  it("keeps every screen when they still fit", () => {
    const result = selectDesk(DEFAULT_SETUP, DESK_160);
    expect(result.ok && result.value.monitorIds).toEqual([M27]);
    expect(result.removed).toEqual([]);
  });
});

describe("chairs and accessories", () => {
  it("swaps the chair, including the concept chair", () => {
    const result = selectChair(DEFAULT_SETUP, "concept-rattan-task-chair");
    expect(result.ok && result.value.chairId).toBe("concept-rattan-task-chair");
  });

  it("toggles an accessory on and off", () => {
    const on = toggleAccessory(DEFAULT_SETUP, "smart-led-desk-lamp-1-s");
    expect(on.ok && on.value.accessoryIds).toContain("smart-led-desk-lamp-1-s");
    const off = on.ok ? toggleAccessory(on.value, "smart-led-desk-lamp-1-s") : on;
    expect(off.ok && off.value.accessoryIds).not.toContain("smart-led-desk-lamp-1-s");
  });

  it("removes one copy of a duplicated screen", () => {
    const setup = { ...DEFAULT_SETUP, monitorIds: [M24, M27, M24] };
    expect(removeOneMonitor(setup, M24).monitorIds).toEqual([M24, M27]);
    expect(removeOneMonitor(setup, "missing").monitorIds).toEqual(setup.monitorIds);
  });
});

describe("normalizeSetup", () => {
  it("repairs untrusted input", () => {
    const setup = normalizeSetup({
      deskId: "not-a-desk",
      chairId: M24,
      monitorIds: [M34, M34, "nope"],
      accessoryIds: ["logitech-mx-keyboard", "logitech-mx-keyboard", DESK_120],
    });
    expect(setup.deskId).toBe(DEFAULT_SETUP.deskId);
    expect(setup.chairId).toBe(DEFAULT_SETUP.chairId);
    expect(setup.monitorIds).toEqual([M34]);
    expect(setup.accessoryIds).toEqual(["logitech-mx-keyboard"]);
  });
});

describe("lineItems", () => {
  it("groups duplicate screens into one line with a quantity", () => {
    const setup = { ...DEFAULT_SETUP, monitorIds: [M24, M24], accessoryIds: [] };
    const lines = lineItems(setup);
    expect(lines.map((l) => [l.product.id, l.quantity])).toEqual([
      [DEFAULT_SETUP.deskId, 1],
      [DEFAULT_SETUP.chairId, 1],
      [M24, 2],
    ]);
    expect(itemCount(setup)).toBe(4);
  });
});
