import { z } from "zod";

/**
 * Parses the schema.org Product JSON-LD that monis.rent embeds in every
 * product page. Pure function: HTML in, validated product out.
 */

const offerSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative(),
  priceCurrency: z.string(),
  priceSpecification: z.object({ unitText: z.string() }).optional(),
});

const productSchema = z.object({
  "@type": z.literal("Product"),
  name: z.string().min(1),
  description: z.string().default(""),
  sku: z.string().min(1),
  url: z.string().url(),
  image: z.union([z.string().url(), z.array(z.string().url()).min(1)]),
  offers: z.object({ offers: z.array(offerSchema).min(1) }),
});

export type MonisProduct = {
  slug: string;
  name: string;
  description: string;
  url: string;
  imageUrls: string[];
  currency: string;
  weeklyPriceCents: number;
  monthlyPriceCents: number | null;
};

const LD_JSON = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;

const toCents = (dollars: number) => Math.round(dollars * 100);

function findOffer(offers: z.infer<typeof offerSchema>[], unit: "week" | "month") {
  return offers.find(
    (o) =>
      o.priceSpecification?.unitText === unit ||
      o.name.toLowerCase().startsWith(unit === "week" ? "weekly" : "monthly"),
  );
}

export function parseMonisProduct(html: string): MonisProduct {
  for (const [, raw] of html.matchAll(LD_JSON)) {
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }
    const parsed = productSchema.safeParse(json);
    if (!parsed.success) continue;

    const p = parsed.data;
    const weekly = findOffer(p.offers.offers, "week");
    if (!weekly) throw new Error(`No weekly offer for ${p.sku}`);
    const monthly = findOffer(p.offers.offers, "month");

    return {
      slug: p.sku,
      name: p.name,
      description: p.description,
      url: p.url,
      imageUrls: Array.isArray(p.image) ? p.image : [p.image],
      currency: weekly.priceCurrency,
      weeklyPriceCents: toCents(weekly.price),
      monthlyPriceCents: monthly ? toCents(monthly.price) : null,
    };
  }
  throw new Error("No schema.org Product JSON-LD found in page");
}
