import { describe, expect, it } from "vitest";
import { earliestDeliveryDate, latestDeliveryDate } from "./delivery";

describe("earliestDeliveryDate", () => {
  it("is tomorrow in Bali when ordering before the cutoff", () => {
    // 09:00 in Bali on 25 Nov = 01:00 UTC
    expect(earliestDeliveryDate(new Date("2026-11-25T01:00:00Z"))).toBe("2026-11-26");
  });

  it("uses the Bali calendar, not UTC", () => {
    // 23:30 UTC on 24 Nov is already 07:30 on 25 Nov in Bali
    expect(earliestDeliveryDate(new Date("2026-11-24T23:30:00Z"))).toBe("2026-11-26");
  });

  it("skips a day after the evening cutoff", () => {
    // 19:00 in Bali = 11:00 UTC
    expect(earliestDeliveryDate(new Date("2026-11-25T11:00:00Z"))).toBe("2026-11-27");
  });

  it("allows booking up to 90 days ahead", () => {
    expect(latestDeliveryDate(new Date("2026-11-25T01:00:00Z"))).toBe("2027-02-23");
  });
});
