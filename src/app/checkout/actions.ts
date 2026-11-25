"use server";

import { randomBytes } from "node:crypto";
import { quote } from "@/domain/pricing";
import { decodeSetup, encodeSetup } from "@/domain/share-code";
import type { PlanId } from "@/domain/types";
import { rentalRequestSchema, type FieldName } from "@/features/checkout/schema";

export type RentalRequestState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<FieldName, string>>;
      values: Record<string, string>;
    }
  | {
      status: "success";
      reference: string;
      name: string;
      setupCode: string;
      plan: PlanId;
      periods: number;
      totalCents: number;
      deliveryDate: string;
      area: string;
    };

/**
 * Validates a rental request and recomputes the price on the server from the
 * setup code. The client's displayed total is never trusted.
 *
 * In this prototype the request isn't sent anywhere: in production this would
 * create a booking in monis.rent's system and notify their team.
 */
export async function submitRentalRequest(_prev: RentalRequestState, formData: FormData): Promise<RentalRequestState> {
  const raw = Object.fromEntries([...formData].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const parsed = rentalRequestSchema().safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<FieldName, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as FieldName;
      fieldErrors[field] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values: raw };
  }

  const data = parsed.data;
  const setup = decodeSetup(data.setup);
  if (!setup) {
    return {
      status: "error",
      message: "We couldn't read your setup. Go back to the designer and try again.",
      fieldErrors: {},
      values: raw,
    };
  }

  const { totalCents } = quote(setup, data.plan, data.periods);
  const reference = `MWS-${randomBytes(3).toString("hex").toUpperCase()}`;

  return {
    status: "success",
    reference,
    name: data.name,
    setupCode: encodeSetup(setup),
    plan: data.plan,
    periods: data.periods,
    totalCents,
    deliveryDate: data.deliveryDate,
    area: data.area,
  };
}
