/**
 * Pulls real product data (name, prices, photos) from monis.rent and writes a
 * dated snapshot to src/data/monis-catalog.json. Images are downloaded to
 * public/products so the deployed app never depends on hotlinking.
 *
 * Usage: npm run sync:catalog
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseMonisProduct, type MonisProduct } from "./lib/parse-product";

export const MONIS_SLUGS = [
  // desks
  "adjustable-wooden-desk",
  "electrical-adjustable-desk",
  "dual-motor-electric-standing-desk",
  // chairs
  "ergonomic-office-chair",
  // monitors
  "24-full-hd-office-monitor-a24i-2026",
  "27-4-k-multimedia-monitor",
  "34-4-k-curved-monitor-180-hz",
  "apple-studio-display",
  // desk accessories
  "smart-led-desk-lamp-1-s",
  "hue-signe-gradient-lamp",
  "logitech-mx-keyboard",
  "logitech-mx-master-mouse-s3",
  "ergonomic-laptop-stand",
  "logitech-4-k-webcam",
  // extras
  "nespresso-essenza-coffee-machine",
  "starlink-kit-incl-plan",
  "smart-air-purifier",
  // zones: coffee station
  "bosch-coffee-maker",
  // zones: outdoor gear
  "padel-racket",
  "insta360-action-camera",
  // zones: relax
  "43-smart-tv-4-k",
  "play-station-5",
  "marshall-woburn-ii-bluetooth",
  // zones: garage
  "adjustable-dumbbell-weight-set",
  "foldable-walk-pad",
] as const;

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_JSON = path.join(ROOT, "src/data/monis-catalog.json");
const OUT_IMG = path.join(ROOT, "public/products");
const UA = "Mozilla/5.0 (workspace-designer catalog sync)";

async function fetchText(url: string) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

async function download(url: string, file: string) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

async function syncOne(slug: string) {
  const product: MonisProduct = parseMonisProduct(
    await fetchText(`https://monis.rent/products/${slug}`),
  );
  const ext = path.extname(new URL(product.imageUrls[0]).pathname) || ".jpg";
  const image = `/products/${slug}${ext}`;
  await download(product.imageUrls[0], path.join(OUT_IMG, `${slug}${ext}`));
  return { ...product, slug, image };
}

async function main() {
  await mkdir(OUT_IMG, { recursive: true });
  const products = [];
  for (const slug of MONIS_SLUGS) {
    products.push(await syncOne(slug));
    console.log(`✓ ${slug}`);
  }
  const snapshot = { source: "https://monis.rent", syncedAt: new Date().toISOString().slice(0, 10), products };
  await writeFile(OUT_JSON, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote ${products.length} products to ${path.relative(ROOT, OUT_JSON)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
