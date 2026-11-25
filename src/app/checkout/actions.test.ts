import { describe, expect, it } from "vitest";
import { earliestDeliveryDate } from "@/domain/delivery";
import { quote } from "@/domain/pricing";
import { decodeSetup } from "@/domain/share-code";
import { submitRentalRequest } from "./actions";

function form(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const values = {
    setup: "D2.C1.M27x2.KB",
    plan: "month",
    periods: "2",
    name: "Alex Rivera",
    email: "alex@example.com",
    whatsapp: "+62 812 3456 7890",
    area: "Canggu",
    address: "Villa Kayu, Jl. Pantai Batu Bolong 12",
    deliveryDate: earliestDeliveryDate(new Date()),
    notes: "",
    ...overrides,
  };
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

describe("submitRentalRequest", () => {
  it("accepts a valid request and prices it on the server", async () => {
    const result = await submitRentalRequest({ status: "idle" }, form());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.reference).toMatch(/^MWS-[0-9A-F]{6}$/);
    expect(result.totalCents).toBe(quote(decodeSetup("D2.C1.M27x2.KB")!, "month", 2).totalCents);
  });

  it("returns field errors and keeps what the user typed", async () => {
    const result = await submitRentalRequest({ status: "idle" }, form({ email: "nope", area: "Mars" }));
    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(result.fieldErrors.email).toMatch(/valid email/);
    expect(result.fieldErrors.area).toMatch(/area/);
    expect(result.values.name).toBe("Alex Rivera");
  });

  it("rejects delivery dates in the past", async () => {
    const result = await submitRentalRequest({ status: "idle" }, form({ deliveryDate: "2020-01-01" }));
    expect(result.status === "error" && result.fieldErrors.deliveryDate).toMatch(/earliest/);
  });

  it("rejects a setup code it can't read", async () => {
    const result = await submitRentalRequest({ status: "idle" }, form({ setup: "???" }));
    expect(result.status === "error" && result.message).toMatch(/couldn't read your setup/);
  });

  it("caps the rental length per plan", async () => {
    const result = await submitRentalRequest({ status: "idle" }, form({ periods: "40" }));
    expect(result.status === "error" && result.fieldErrors.periods).toBeTruthy();
  });
});
