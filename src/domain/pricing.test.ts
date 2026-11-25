import { describe, expect, it } from "vitest";
import { getProduct } from "./catalog";
import { formatCents } from "./money";
import { monthlySavingPercent, quote } from "./pricing";
import type { Setup } from "./types";

const setup: Setup = {
  deskId: "electrical-adjustable-desk",
  chairId: "ergonomic-office-chair",
  monitorIds: ["24-full-hd-office-monitor-a24i-2026", "24-full-hd-office-monitor-a24i-2026"],
  accessoryIds: ["logitech-mx-keyboard"],
};

const ids = [setup.deskId, setup.chairId, ...setup.monitorIds, ...setup.accessoryIds];
const sum = (pick: (id: string) => number) => ids.reduce((total, id) => total + pick(id), 0);

describe("quote", () => {
  it("adds weekly prices in integer cents, counting duplicate screens", () => {
    const q = quote(setup, "week");
    expect(q.perPeriodCents).toBe(sum((id) => getProduct(id).weeklyCents));
    expect(q.lines.find((l) => l.product.id === setup.monitorIds[0])?.quantity).toBe(2);
    expect(Number.isInteger(q.totalCents)).toBe(true);
  });

  it("multiplies by the number of periods", () => {
    const q = quote(setup, "month", 3);
    expect(q.totalCents).toBe(sum((id) => getProduct(id).monthlyCents) * 3);
  });

  it("reports the monthly saving against four weekly payments", () => {
    const q = quote(setup, "month");
    const weekly = sum((id) => getProduct(id).weeklyCents) * 4;
    expect(q.monthlySavingCents).toBe(weekly - q.perPeriodCents);
    expect(quote(setup, "week").monthlySavingCents).toBe(0);
    expect(monthlySavingPercent(setup)).toBeGreaterThan(0);
  });

  it("rejects an invalid number of periods", () => {
    expect(() => quote(setup, "week", 0)).toThrow(RangeError);
    expect(() => quote(setup, "week", 1.5)).toThrow(RangeError);
    expect(() => quote(setup, "month", 13)).toThrow(RangeError);
  });
});

describe("formatCents", () => {
  it("formats USD and drops .00 on whole dollars", () => {
    expect(formatCents(630)).toBe("$6.30");
    expect(formatCents(1200)).toBe("$12");
    expect(formatCents(123456)).toBe("$1,234.56");
  });
});
