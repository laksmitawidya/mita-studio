import snapshot from "@/data/monis-catalog.json";
import type { Category, ModelSpec, Product, ZoneId } from "./types";

/**
 * Real monis.rent data (name, prices, photo, link) comes from the synced
 * snapshot. What monis doesn't publish in a structured way — category, share
 * code, 3D model and a one-line benefit — is curated here.
 */
type Curated = { code: string; category: Category; zone?: ZoneId; tagline: string; model: ModelSpec };

/** Monitor width in cm from diagonal, including a 2 cm bezel. */
export function monitorWidthCm(inches: number, ratio: "16:9" | "21:9" = "16:9") {
  const factor = ratio === "21:9" ? 0.919 : 0.8716;
  return Math.round(inches * 2.54 * factor + 2);
}

const CURATED: Record<string, Curated> = {
  "adjustable-wooden-desk": {
    code: "D1",
    category: "desk",
    tagline: "Hand-crank sit-stand · 120 × 70 cm",
    model: { kind: "desk", style: "mechanical", widthCm: 120, top: "#c8a27a", frame: "#2b2b2b" },
  },
  "electrical-adjustable-desk": {
    code: "D2",
    category: "desk",
    tagline: "Quiet electric sit-stand · 140 × 70 cm",
    model: { kind: "desk", style: "electric", widthCm: 140, top: "#ece8e1", frame: "#d9d6d0" },
  },
  "dual-motor-electric-standing-desk": {
    code: "D3",
    category: "desk",
    tagline: "Dual motor, 120 kg load · 160 × 70 cm",
    model: { kind: "desk", style: "dualMotor", widthCm: 160, top: "#7a5a43", frame: "#1f1f1f" },
  },
  "ergonomic-office-chair": {
    code: "C1",
    category: "chair",
    tagline: "Mesh back, lumbar support, 4D armrests",
    model: { kind: "chair", style: "mesh" },
  },
  "24-full-hd-office-monitor-a24i-2026": {
    code: "M24",
    category: "monitor",
    tagline: "Full HD for docs, email and calls",
    model: { kind: "monitor", inches: 24, curved: false, widthCm: monitorWidthCm(24), bezel: "#1d1d1f" },
  },
  "27-4-k-multimedia-monitor": {
    code: "M27",
    category: "monitor",
    tagline: "Sharp 4K for code and design",
    model: { kind: "monitor", inches: 27, curved: false, widthCm: monitorWidthCm(27), bezel: "#1d1d1f" },
  },
  "34-4-k-curved-monitor-180-hz": {
    code: "M34",
    category: "monitor",
    tagline: "Ultrawide curve, two windows side by side",
    model: { kind: "monitor", inches: 34, curved: true, widthCm: monitorWidthCm(34, "21:9"), bezel: "#1d1d1f" },
  },
  "apple-studio-display": {
    code: "MSD",
    category: "monitor",
    tagline: "5K, colour-accurate, built-in camera",
    model: { kind: "monitor", inches: 27, curved: false, widthCm: 62, bezel: "#c9cbd0" },
  },
  "smart-led-desk-lamp-1-s": {
    code: "L1",
    category: "accessory",
    tagline: "Even, flicker-free task light",
    model: { kind: "lamp", style: "arm" },
  },
  "hue-signe-gradient-lamp": {
    code: "L2",
    category: "accessory",
    tagline: "Soft gradient light for calls and evenings",
    model: { kind: "lamp", style: "gradient" },
  },
  "logitech-mx-keyboard": {
    code: "KB",
    category: "accessory",
    tagline: "Full-size, backlit, multi-device",
    model: { kind: "keyboard" },
  },
  "logitech-mx-master-mouse-s3": {
    code: "MS",
    category: "accessory",
    tagline: "Quiet clicks, all-day ergonomic grip",
    model: { kind: "mouse" },
  },
  "ergonomic-laptop-stand": {
    code: "LS",
    category: "accessory",
    tagline: "Lifts your laptop screen to eye level",
    model: { kind: "laptopStand" },
  },
  "logitech-4-k-webcam": {
    code: "WC",
    category: "accessory",
    tagline: "4K video for clear client calls",
    model: { kind: "webcam" },
  },
  "nespresso-essenza-coffee-machine": {
    code: "CF",
    category: "zone",
    zone: "coffee",
    tagline: "Espresso without leaving the villa",
    model: { kind: "coffee", style: "espresso" },
  },
  "starlink-kit-incl-plan": {
    code: "SL",
    category: "extra",
    tagline: "Backup internet, plan included",
    model: { kind: "starlink" },
  },
  "smart-air-purifier": {
    code: "AP",
    category: "extra",
    tagline: "Cleaner air during burning season",
    model: { kind: "purifier" },
  },
  "bosch-coffee-maker": {
    code: "BC",
    category: "zone",
    zone: "coffee",
    tagline: "A full pot for slow mornings",
    model: { kind: "coffee", style: "drip" },
  },
  "padel-racket": {
    code: "PR",
    category: "zone",
    zone: "outdoor",
    tagline: "For after-work games at the club",
    model: { kind: "padel" },
  },
  "insta360-action-camera": {
    code: "IC",
    category: "zone",
    zone: "outdoor",
    tagline: "Film the surf, the ride, the trip",
    model: { kind: "actionCam" },
  },
  "43-smart-tv-4-k": {
    code: "TV",
    category: "zone",
    zone: "relax",
    tagline: "Big screen for films and match nights",
    model: { kind: "tv" },
  },
  "play-station-5": {
    code: "PS",
    category: "zone",
    zone: "relax",
    tagline: "Switch off properly after work",
    model: { kind: "console" },
  },
  "marshall-woburn-ii-bluetooth": {
    code: "SP",
    category: "zone",
    zone: "relax",
    tagline: "Room-filling sound for the villa",
    model: { kind: "speaker" },
  },
  "adjustable-dumbbell-weight-set": {
    code: "DB",
    category: "zone",
    zone: "garage",
    tagline: "A home gym in one compact set",
    model: { kind: "dumbbells" },
  },
  "foldable-walk-pad": {
    code: "WP",
    category: "zone",
    zone: "garage",
    tagline: "Walk your steps during calls",
    model: { kind: "walkPad" },
  },
};

/**
 * monis.rent lists a single chair and no plants, while the brief asks for at
 * least two chairs and mentions plants. These are clearly marked concepts with
 * illustrative prices.
 */
const CONCEPT_PRODUCTS: Product[] = [
  {
    id: "concept-rattan-task-chair",
    code: "C2",
    category: "chair",
    name: "Rattan Task Chair",
    tagline: "Breathable woven seat for warm afternoons",
    image: "/concept/rattan-task-chair.svg",
    url: null,
    weeklyCents: 500,
    monthlyCents: 1400,
    source: "concept",
    model: { kind: "chair", style: "rattan" },
  },
  {
    id: "concept-monstera-plant",
    code: "PL",
    category: "extra",
    name: "Monstera Floor Plant",
    tagline: "A bit of green next to your desk",
    image: "/concept/monstera-plant.svg",
    url: null,
    weeklyCents: 150,
    monthlyCents: 400,
    source: "concept",
    model: { kind: "plant" },
  },
  // monis.rent doesn't list these. Concepts that complete the zones in the brief.
  {
    id: "concept-surfboard",
    code: "SB",
    category: "zone",
    zone: "outdoor",
    name: "Surfboard 7'2\" Mini Mal",
    tagline: "Dawn patrol before the first call",
    image: "/concept/surfboard.svg",
    url: null,
    weeklyCents: 2500,
    monthlyCents: 6500,
    source: "concept",
    model: { kind: "surfboard" },
  },
  {
    id: "concept-motorbike",
    code: "MB",
    category: "zone",
    zone: "outdoor",
    name: "Scooter 125cc",
    tagline: "How everyone gets around Bali",
    image: "/concept/scooter.svg",
    url: null,
    weeklyCents: 3000,
    monthlyCents: 8000,
    source: "concept",
    model: { kind: "motorbike" },
  },
  {
    id: "concept-bean-bag",
    code: "BB",
    category: "zone",
    zone: "relax",
    name: "Bean Bag Lounger",
    tagline: "Sink in between deep-work blocks",
    image: "/concept/bean-bag.svg",
    url: null,
    weeklyCents: 400,
    monthlyCents: 1000,
    source: "concept",
    model: { kind: "beanBag" },
  },
  {
    id: "concept-tool-shelf",
    code: "TS",
    category: "zone",
    zone: "garage",
    name: "Tool & Storage Shelf",
    tagline: "Room for boards, helmets and tools",
    image: "/concept/tool-shelf.svg",
    url: null,
    weeklyCents: 300,
    monthlyCents: 800,
    source: "concept",
    model: { kind: "toolShelf" },
  },
];

export type Zone = { id: ZoneId; title: string; blurb: string };

/** Order matches how the zones are laid out below the room. */
export const ZONES: readonly Zone[] = [
  { id: "coffee", title: "Coffee Station", blurb: "A proper cup without leaving your desk." },
  { id: "outdoor", title: "Outdoor Gear", blurb: "Surf, ride and play once the laptop closes." },
  { id: "relax", title: "Relax Zone", blurb: "A corner to switch off after work." },
  { id: "garage", title: "Garage Space", blurb: "Training and storage, out of the way." },
];

function buildCatalog(): Product[] {
  const fromMonis = snapshot.products.map((p): Product => {
    const curated = CURATED[p.slug];
    if (!curated) throw new Error(`No curated metadata for monis product "${p.slug}"`);
    return {
      id: p.slug,
      code: curated.code,
      category: curated.category,
      zone: curated.zone,
      name: p.name,
      tagline: curated.tagline,
      image: p.image,
      url: p.url,
      weeklyCents: p.weeklyPriceCents,
      monthlyCents: p.monthlyPriceCents ?? p.weeklyPriceCents * 4,
      source: "monis",
      model: curated.model,
    };
  });
  return [...fromMonis, ...CONCEPT_PRODUCTS];
}

export const CATALOG: readonly Product[] = buildCatalog();
export const CATALOG_SYNCED_AT = snapshot.syncedAt;

const byId = new Map(CATALOG.map((p) => [p.id, p]));
const byCode = new Map(CATALOG.map((p) => [p.code, p]));

export function findProduct(id: string): Product | undefined {
  return byId.get(id);
}

export function getProduct(id: string): Product {
  const product = byId.get(id);
  if (!product) throw new Error(`Unknown product "${id}"`);
  return product;
}

export function findProductByCode(code: string): Product | undefined {
  return byCode.get(code);
}

export function productsIn(category: Category): Product[] {
  return CATALOG.filter((p) => p.category === category);
}

export function productsInZone(zone: ZoneId): Product[] {
  return CATALOG.filter((p) => p.category === "zone" && p.zone === zone);
}

export function deskWidthCm(product: Product): number {
  if (product.model.kind !== "desk") throw new Error(`${product.id} is not a desk`);
  return product.model.widthCm;
}

export function monitorFootprintCm(product: Product): number {
  if (product.model.kind !== "monitor") throw new Error(`${product.id} is not a monitor`);
  return product.model.widthCm;
}
