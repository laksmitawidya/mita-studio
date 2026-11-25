import { deskWidthCm, findProduct, getProduct, monitorFootprintCm } from "./catalog";
import type { Product, Result, Setup } from "./types";

export const MAX_MONITORS = 3;
/** Categories that are simply on or off in a setup (stored in accessoryIds). */
const TOGGLEABLE: Product["category"][] = ["accessory", "extra", "zone"];
/** With three screens the outer two are angled inwards and take less width. */
const ANGLED_FOOTPRINT = 0.85;

export const DEFAULT_SETUP: Setup = {
  deskId: "electrical-adjustable-desk",
  chairId: "ergonomic-office-chair",
  monitorIds: ["27-4-k-multimedia-monitor"],
  accessoryIds: ["ergonomic-laptop-stand", "logitech-mx-keyboard", "logitech-mx-master-mouse-s3"],
};

/** Width in cm that a row of monitors needs on the desk. */
export function monitorRowWidthCm(monitorIds: string[]): number {
  const widths = monitorIds.map((id) => monitorFootprintCm(getProduct(id)));
  if (widths.length === 3) return widths[1] + (widths[0] + widths[2]) * ANGLED_FOOTPRINT;
  return widths.reduce((sum, w) => sum + w, 0);
}

export function fitsOnDesk(deskId: string, monitorIds: string[]): boolean {
  if (monitorIds.length > MAX_MONITORS) return false;
  return monitorRowWidthCm(monitorIds) <= deskWidthCm(getProduct(deskId));
}

function requireCategory(id: string, categories: Product["category"][]): Result<Product> {
  const product = findProduct(id);
  if (!product || !categories.includes(product.category)) {
    return { ok: false, reason: `That item isn't available here.` };
  }
  return { ok: true, value: product };
}

export function selectChair(setup: Setup, chairId: string): Result<Setup> {
  const found = requireCategory(chairId, ["chair"]);
  if (!found.ok) return found;
  return { ok: true, value: { ...setup, chairId } };
}

/**
 * Switching to a narrower desk removes screens from the right until the row
 * fits, and says which ones were removed.
 */
export function selectDesk(setup: Setup, deskId: string): Result<Setup> & { removed?: Product[] } {
  const found = requireCategory(deskId, ["desk"]);
  if (!found.ok) return found;

  const monitorIds = [...setup.monitorIds];
  const removed: Product[] = [];
  while (monitorIds.length && !fitsOnDesk(deskId, monitorIds)) {
    removed.push(getProduct(monitorIds.pop()!));
  }
  return { ok: true, value: { ...setup, deskId, monitorIds }, removed };
}

export function addMonitor(setup: Setup, monitorId: string): Result<Setup> {
  const found = requireCategory(monitorId, ["monitor"]);
  if (!found.ok) return found;

  if (setup.monitorIds.length >= MAX_MONITORS) {
    return { ok: false, reason: `${MAX_MONITORS} screens is the maximum for one desk.` };
  }
  const next = [...setup.monitorIds, monitorId];
  if (!fitsOnDesk(setup.deskId, next)) {
    const desk = getProduct(setup.deskId);
    return {
      ok: false,
      reason: `${found.value.name} doesn't fit next to your screens on the ${deskWidthCm(desk)} cm desk. Pick a wider desk or a smaller screen.`,
    };
  }
  return { ok: true, value: { ...setup, monitorIds: next } };
}

export function removeMonitorAt(setup: Setup, index: number): Setup {
  return { ...setup, monitorIds: setup.monitorIds.filter((_, i) => i !== index) };
}

export function removeOneMonitor(setup: Setup, monitorId: string): Setup {
  const index = setup.monitorIds.lastIndexOf(monitorId);
  return index === -1 ? setup : removeMonitorAt(setup, index);
}

export function toggleAccessory(setup: Setup, productId: string): Result<Setup> {
  const found = requireCategory(productId, TOGGLEABLE);
  if (!found.ok) return found;
  const has = setup.accessoryIds.includes(productId);
  return {
    ok: true,
    value: {
      ...setup,
      accessoryIds: has ? setup.accessoryIds.filter((id) => id !== productId) : [...setup.accessoryIds, productId],
    },
  };
}

/**
 * Turns untrusted input (share links, saved state) into a valid setup:
 * unknown ids are dropped, missing desk/chair fall back to defaults,
 * duplicates removed, and screens trimmed to what fits.
 */
export function normalizeSetup(input: Partial<Setup>): Setup {
  const isA = (id: unknown, category: Product["category"][]) =>
    typeof id === "string" && requireCategory(id, category).ok;

  const deskId = isA(input.deskId, ["desk"]) ? input.deskId! : DEFAULT_SETUP.deskId;
  const chairId = isA(input.chairId, ["chair"]) ? input.chairId! : DEFAULT_SETUP.chairId;

  const monitorIds: string[] = [];
  for (const id of input.monitorIds ?? []) {
    if (isA(id, ["monitor"]) && fitsOnDesk(deskId, [...monitorIds, id])) monitorIds.push(id);
  }
  const accessoryIds = [...new Set((input.accessoryIds ?? []).filter((id) => isA(id, TOGGLEABLE)))];

  return { deskId, chairId, monitorIds, accessoryIds };
}

export type LineItem = { product: Product; quantity: number };

/** Groups the setup into priced lines: desk, chair, screens, then the rest. */
export function lineItems(setup: Setup): LineItem[] {
  const counts = new Map<string, number>();
  const ordered = [setup.deskId, setup.chairId, ...setup.monitorIds, ...setup.accessoryIds];
  for (const id of ordered) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts].map(([id, quantity]) => ({ product: getProduct(id), quantity }));
}

export function itemCount(setup: Setup): number {
  return 2 + setup.monitorIds.length + setup.accessoryIds.length;
}
