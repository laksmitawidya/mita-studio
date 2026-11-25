import { getProduct } from "./catalog";
import type { ModelSpec, Product, Setup, ZoneId } from "./types";

/**
 * Pure layout: turns a setup into positions in metres. The 3D scene only
 * draws what this returns, which keeps the scene dumb and this testable.
 *
 * Coordinates: desk centred at x=0, front edge towards +z, floor at y=0.
 */
export const DESK_TOP_Y = 0.74;
export const DESK_DEPTH = 0.7;
const MONITOR_ROW_Z = -0.17;
const INPUT_ROW_Z = 0.12;
const OUTER_ANGLE = 0.38;

/** The room the scene draws: open at the front and right, like a cutaway. */
export const ROOM = { minX: -3.6, maxX: 3.6, backZ: -1.15, frontZ: 3.4, wallHeight: 2.6 } as const;

export type ZoneArea = { centre: [number, number]; size: [number, number] };

/** Floor area of each zone (x, z centre and width, depth in metres). */
export const ZONE_AREAS: Record<ZoneId, ZoneArea> = {
  coffee: { centre: [-2.65, -0.62], size: [1.7, 1.0] },
  garage: { centre: [2.6, -0.5], size: [1.9, 1.3] },
  relax: { centre: [2.4, 1.9], size: [2.2, 1.9] },
  outdoor: { centre: [-2.35, 2.15], size: [2.4, 2.2] },
};

/** Where each zone item stands: [x, z, rotationY]. */
const ZONE_SPOTS: Record<string, [number, number, number]> = {
  "nespresso-essenza-coffee-machine": [-3.1, -0.8, 0],
  "bosch-coffee-maker": [-2.5, -0.8, 0],
  "concept-surfboard": [-3.42, 1.55, Math.PI / 2],
  "concept-motorbike": [-2.15, 2.35, -0.7],
  "padel-racket": [-3.45, 2.0, Math.PI / 2],
  "insta360-action-camera": [-3.05, 3.05, 0.4],
  "43-smart-tv-4-k": [2.35, 1.05, 0],
  "play-station-5": [1.55, 1.1, 0],
  "marshall-woburn-ii-bluetooth": [3.2, 1.1, -0.2],
  "concept-bean-bag": [2.3, 2.45, Math.PI + 0.15],
  "concept-tool-shelf": [3.0, -0.92, 0],
  "adjustable-dumbbell-weight-set": [2.05, -0.78, 0],
  "foldable-walk-pad": [2.55, -0.15, Math.PI / 2],
};

export type Placement = {
  /** Stable React key; also used for drop-in animation identity. */
  key: string;
  product: Product;
  model: ModelSpec;
  position: [number, number, number];
  rotationY: number;
};

const cm = (n: number) => n / 100;

function place(key: string, product: Product, position: [number, number, number], rotationY = 0): Placement {
  return { key, product, model: product.model, position, rotationY };
}

function layoutMonitors(monitors: Product[]): Placement[] {
  const widths = monitors.map((m) => (m.model.kind === "monitor" ? cm(m.model.widthCm) : 0));
  const angled = monitors.length === 3;

  if (angled) {
    const [left, centre, right] = widths;
    const halfCentre = centre / 2;
    const offset = (w: number) => halfCentre + (w / 2) * Math.cos(OUTER_ANGLE);
    const forward = (w: number) => (w / 2) * Math.sin(OUTER_ANGLE);
    return [
      place(`monitor-0-${monitors[0].id}`, monitors[0], [-offset(left), DESK_TOP_Y, MONITOR_ROW_Z + forward(left)], OUTER_ANGLE),
      place(`monitor-1-${monitors[1].id}`, monitors[1], [0, DESK_TOP_Y, MONITOR_ROW_Z]),
      place(`monitor-2-${monitors[2].id}`, monitors[2], [offset(right), DESK_TOP_Y, MONITOR_ROW_Z + forward(right)], -OUTER_ANGLE),
    ];
  }

  const total = widths.reduce((a, b) => a + b, 0);
  let x = -total / 2;
  return monitors.map((m, i) => {
    const centre = x + widths[i] / 2;
    x += widths[i];
    return place(`monitor-${i}-${m.id}`, m, [centre, DESK_TOP_Y, MONITOR_ROW_Z]);
  });
}

export function layoutWorkspace(setup: Setup): Placement[] {
  const desk = getProduct(setup.deskId);
  const halfDesk = desk.model.kind === "desk" ? cm(desk.model.widthCm) / 2 : 0.6;
  const accessories = new Set(setup.accessoryIds);
  const has = (id: string) => accessories.has(id);
  const product = (id: string) => getProduct(id);

  const placements: Placement[] = [
    place("desk", desk, [0, 0, 0]),
    place("chair", product(setup.chairId), [0.05, 0, 0.62], Math.PI + 0.12),
  ];

  const monitors = layoutMonitors(setup.monitorIds.map(product));
  placements.push(...monitors);

  if (has("ergonomic-laptop-stand")) {
    const x = monitors.length ? -halfDesk + 0.2 : 0;
    const z = monitors.length ? 0.02 : MONITOR_ROW_Z + 0.05;
    placements.push(place("laptop-stand", product("ergonomic-laptop-stand"), [x, DESK_TOP_Y, z], monitors.length ? 0.25 : 0));
  }
  if (has("logitech-mx-keyboard")) {
    placements.push(place("keyboard", product("logitech-mx-keyboard"), [0, DESK_TOP_Y, INPUT_ROW_Z]));
  }
  if (has("logitech-mx-master-mouse-s3")) {
    placements.push(place("mouse", product("logitech-mx-master-mouse-s3"), [0.3, DESK_TOP_Y, INPUT_ROW_Z]));
  }
  if (has("smart-led-desk-lamp-1-s")) {
    placements.push(place("lamp-arm", product("smart-led-desk-lamp-1-s"), [halfDesk - 0.1, DESK_TOP_Y, -0.24], -0.6));
  }
  if (has("hue-signe-gradient-lamp")) {
    placements.push(place("lamp-gradient", product("hue-signe-gradient-lamp"), [-halfDesk + 0.08, DESK_TOP_Y, -0.26]));
  }
  if (has("logitech-4-k-webcam")) {
    const centre = monitors.find((m) => Math.abs(m.position[0]) < 0.01) ?? monitors[0];
    const y = centre && centre.model.kind === "monitor" ? DESK_TOP_Y + monitorHeight(centre.model.inches) : DESK_TOP_Y + 0.33;
    const [x, , z] = centre ? centre.position : [0, 0, MONITOR_ROW_Z];
    placements.push(place("webcam", product("logitech-4-k-webcam"), [x, y, z], centre?.rotationY ?? 0));
  }

  // Floor and side items around the desk.
  if (has("concept-monstera-plant")) {
    placements.push(place("plant", product("concept-monstera-plant"), [-halfDesk - 0.42, 0, -0.05]));
  }
  if (has("smart-air-purifier")) {
    placements.push(place("purifier", product("smart-air-purifier"), [-halfDesk - 0.38, 0, 0.55]));
  }
  if (has("starlink-kit-incl-plan")) {
    placements.push(place("starlink", product("starlink-kit-incl-plan"), [halfDesk + 0.45, 0, 0.6], -0.5));
  }

  // Zone items, each on its own spot in its area of the room.
  for (const id of setup.accessoryIds) {
    const item = product(id);
    if (item.category !== "zone") continue;
    const spot = ZONE_SPOTS[id];
    if (!spot) throw new Error(`No room spot for zone item "${id}"`);
    placements.push(place(`zone-${id}`, item, [spot[0], 0, spot[1]], spot[2]));
  }

  return placements;
}

/** Zones that have at least one item in the setup. */
export function activeZones(setup: Setup): Set<ZoneId> {
  const zones = new Set<ZoneId>();
  for (const id of setup.accessoryIds) {
    const item = getProduct(id);
    if (item.zone) zones.add(item.zone);
  }
  return zones;
}

/** Height of a monitor's top edge above the desk, in metres (stand included). */
export function monitorHeight(inches: number): number {
  const panelHeight = inches * 2.54 * 0.49 / 100;
  return 0.12 + panelHeight;
}
