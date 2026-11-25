import { z } from "zod";
import { BALI_AREAS, earliestDeliveryDate, latestDeliveryDate } from "@/domain/delivery";
import { PLANS } from "@/domain/pricing";

/** One schema for the checkout form, used by the client and the server action. */
export function rentalRequestSchema(now: Date = new Date()) {
  const earliest = earliestDeliveryDate(now);
  const latest = latestDeliveryDate(now);

  return z
    .object({
      setup: z.string().min(1, "Your setup is empty.").max(200),
      plan: z.enum(["week", "month"]),
      periods: z.coerce.number().int().min(1),
      name: z.string().trim().min(2, "Please enter your name.").max(80),
      email: z.string().trim().email("Please enter a valid email, like you@example.com."),
      whatsapp: z
        .string()
        .trim()
        .regex(/^\+?[0-9 ()-]{7,20}$/, "Use digits with your country code, like +62 812 3456 7890."),
      area: z.enum(BALI_AREAS, { message: "Choose the area you're staying in." }),
      address: z.string().trim().min(5, "Add the villa name or street so the driver can find you.").max(200),
      deliveryDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a delivery date.")
        .refine((d) => d >= earliest, `The earliest delivery is ${earliest}.`)
        .refine((d) => d <= latest, `We take bookings up to 90 days ahead (until ${latest}).`),
      notes: z.string().trim().max(500).optional().default(""),
    })
    .refine((v) => v.periods <= PLANS[v.plan].maxPeriods, {
      path: ["periods"],
      message: "That rental is longer than we can book online.",
    });
}

export type RentalRequest = z.infer<ReturnType<typeof rentalRequestSchema>>;
export type FieldName = keyof RentalRequest;
