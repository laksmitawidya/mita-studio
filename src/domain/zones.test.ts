import { describe, expect, it } from "vitest";
import { CATALOG, ZONES, productsInZone } from "./catalog";
import { ROOM, ZONE_AREAS, activeZones, layoutWorkspace } from "./placement";
import { quote } from "./pricing";
import { decodeSetup, encodeSetup } from "./share-code";
import { DEFAULT_SETUP, normalizeSetup, toggleAccessory } from "./workspace";

const ZONE_ITEMS = CATALOG.filter((p) => p.category === "zone");
const everything = { ...DEFAULT_SETUP, accessoryIds: [...DEFAULT_SETUP.accessoryIds, ...ZONE_ITEMS.map((p) => p.id)] };

describe("zones", () => {
  it("gives every zone at least two items, mixing real monis products and labelled concepts", () => {
    for (const zone of ZONES) {
      const items = productsInZone(zone.id);
      expect(items.length, zone.id).toBeGreaterThanOrEqual(2);
    }
    expect(ZONE_ITEMS.filter((p) => p.source === "monis").length).toBeGreaterThanOrEqual(8);
    for (const concept of ZONE_ITEMS.filter((p) => p.source === "concept")) expect(concept.url).toBeNull();
  });

  it("keeps share codes unique across the whole catalog", () => {
    const codes = CATALOG.map((p) => p.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("toggles zone items like accessories", () => {
    const on = toggleAccessory(DEFAULT_SETUP, "concept-surfboard");
    expect(on.ok && on.value.accessoryIds).toContain("concept-surfboard");
    const off = on.ok ? toggleAccessory(on.value, "concept-surfboard") : on;
    expect(off.ok && off.value.accessoryIds).not.toContain("concept-surfboard");
  });

  it("round-trips a fully loaded setup through a share code", () => {
    const setup = normalizeSetup(everything);
    expect(decodeSetup(encodeSetup(setup))).toEqual(setup);
  });

  it("prices zone items in the quote", () => {
    const withTv = { ...DEFAULT_SETUP, accessoryIds: ["43-smart-tv-4-k"] };
    const base = { ...DEFAULT_SETUP, accessoryIds: [] };
    expect(quote(withTv, "month").perPeriodCents - quote(base, "month").perPeriodCents).toBe(
      CATALOG.find((p) => p.id === "43-smart-tv-4-k")!.monthlyCents,
    );
  });

  it("places every zone item inside its own zone area and inside the room", () => {
    const placements = layoutWorkspace(normalizeSetup(everything)).filter((p) => p.product.category === "zone");
    expect(placements).toHaveLength(ZONE_ITEMS.length);
    for (const p of placements) {
      const [x, , z] = p.position;
      const area = ZONE_AREAS[p.product.zone!];
      expect(Math.abs(x - area.centre[0]), p.key).toBeLessThanOrEqual(area.size[0] / 2);
      expect(Math.abs(z - area.centre[1]), p.key).toBeLessThanOrEqual(area.size[1] / 2);
      expect(x).toBeGreaterThan(ROOM.minX);
      expect(x).toBeLessThan(ROOM.maxX);
      expect(z).toBeGreaterThan(ROOM.backZ);
      expect(z).toBeLessThan(ROOM.frontZ);
    }
  });

  it("keeps zone areas clear of the widest desk and of each other", () => {
    // 160 cm desk plus the plant and purifier beside it, from the wall to behind the chair.
    const desk = { centre: [0, -0.1], size: [2 * (0.8 + 0.45), 2.0] };
    const areas = Object.entries(ZONE_AREAS);
    for (const [id, a] of areas) {
      const overlapX = Math.abs(a.centre[0] - desk.centre[0]) < (a.size[0] + desk.size[0]) / 2;
      const overlapZ = Math.abs(a.centre[1] - desk.centre[1]) < (a.size[1] + desk.size[1]) / 2;
      expect(overlapX && overlapZ, `${id} overlaps the desk area`).toBe(false);
    }
    for (let i = 0; i < areas.length; i++) {
      for (let j = i + 1; j < areas.length; j++) {
        const [, a] = areas[i];
        const [, b] = areas[j];
        const overlapX = Math.abs(a.centre[0] - b.centre[0]) < (a.size[0] + b.size[0]) / 2;
        const overlapZ = Math.abs(a.centre[1] - b.centre[1]) < (a.size[1] + b.size[1]) / 2;
        expect(overlapX && overlapZ, `${areas[i][0]} vs ${areas[j][0]}`).toBe(false);
      }
    }
  });

  it("reports which zones are in use", () => {
    expect([...activeZones({ ...DEFAULT_SETUP, accessoryIds: ["play-station-5", "padel-racket"] })].sort()).toEqual([
      "outdoor",
      "relax",
    ]);
  });
});
