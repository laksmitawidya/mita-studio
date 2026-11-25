export type Category = "desk" | "chair" | "monitor" | "accessory" | "extra" | "zone";

/** Areas around the desk that turn a villa room into a home base. */
export type ZoneId = "coffee" | "outdoor" | "relax" | "garage";

export type PlanId = "week" | "month";

/** What the 3D scene should draw for a product. Pure data, no three.js. */
export type ModelSpec =
  | { kind: "desk"; style: "mechanical" | "electric" | "dualMotor"; widthCm: number; top: string; frame: string }
  | { kind: "chair"; style: "mesh" | "rattan" }
  | { kind: "monitor"; inches: number; curved: boolean; widthCm: number; bezel: string }
  | { kind: "lamp"; style: "arm" | "gradient" }
  | { kind: "keyboard" }
  | { kind: "mouse" }
  | { kind: "laptopStand" }
  | { kind: "webcam" }
  | { kind: "coffee"; style: "espresso" | "drip" }
  | { kind: "starlink" }
  | { kind: "purifier" }
  | { kind: "plant" }
  | { kind: "surfboard" }
  | { kind: "motorbike" }
  | { kind: "padel" }
  | { kind: "actionCam" }
  | { kind: "tv" }
  | { kind: "console" }
  | { kind: "speaker" }
  | { kind: "beanBag" }
  | { kind: "dumbbells" }
  | { kind: "walkPad" }
  | { kind: "toolShelf" };

export type ModelKind = ModelSpec["kind"];

export interface Product {
  /** Stable id: the monis.rent slug, or `concept-*` for our own items. */
  id: string;
  /** Short code used in share links. */
  code: string;
  category: Category;
  /** Set for category "zone": which area of the room the item lives in. */
  zone?: ZoneId;
  name: string;
  /** One-line benefit shown on the card. */
  tagline: string;
  image: string;
  /** Product page on monis.rent; null for concept items. */
  url: string | null;
  weeklyCents: number;
  monthlyCents: number;
  /** "concept" items are not monis inventory and are labelled as such. */
  source: "monis" | "concept";
  model: ModelSpec;
}

export interface Setup {
  deskId: string;
  chairId: string;
  /** Ordered left to right. Duplicates allowed (two of the same screen). */
  monitorIds: string[];
  /** Accessories, extras and zone items, each at most once. */
  accessoryIds: string[];
}

export type Result<T> = { ok: true; value: T } | { ok: false; reason: string };
