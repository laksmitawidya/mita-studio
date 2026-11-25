import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseMonisProduct } from "./parse-product";

const fixture = readFileSync(path.join(__dirname, "../../tests/fixtures/monis-product-chair.html"), "utf8");

describe("parseMonisProduct", () => {
  it("reads name, prices in cents, photos and link from a real monis page", () => {
    const product = parseMonisProduct(fixture);
    expect(product).toMatchObject({
      slug: "ergonomic-office-chair",
      name: "Ergonomic Office Chair",
      currency: "USD",
      weeklyPriceCents: 630,
      monthlyPriceCents: 1680,
      url: "https://www.monis.rent/products/ergonomic-office-chair",
    });
    expect(product.imageUrls[0]).toMatch(/^https:\/\/strapi\.monis\.rent\/uploads\//);
  });

  it("skips malformed JSON-LD blocks and keeps looking", () => {
    const html = `<script type="application/ld+json">{oops</script>${fixture}`;
    expect(parseMonisProduct(html).slug).toBe("ergonomic-office-chair");
  });

  it("fails loudly when the page has no product data", () => {
    expect(() => parseMonisProduct("<html></html>")).toThrow(/No schema.org Product/);
  });
});
