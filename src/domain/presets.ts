import type { PlanId, Setup } from "./types";
import { normalizeSetup } from "./workspace";

/**
 * Starting points built around the people monis.rent serves, loosely based on
 * their real bundles (Essentials, Founders, Trading, Studio).
 */
export interface Preset {
  id: string;
  title: string;
  persona: string;
  description: string;
  plan: PlanId;
  setup: Setup;
}

export const PRESETS: readonly Preset[] = [
  {
    id: "essentials",
    title: "Essentials",
    persona: "Just landed",
    description: "A proper chair and one screen, rented by the week.",
    plan: "week",
    setup: normalizeSetup({
      deskId: "adjustable-wooden-desk",
      chairId: "ergonomic-office-chair",
      monitorIds: ["24-full-hd-office-monitor-a24i-2026"],
      accessoryIds: ["ergonomic-laptop-stand", "logitech-mx-master-mouse-s3"],
    }),
  },
  {
    id: "founders",
    title: "Founder",
    persona: "Remote engineer",
    description: "Sit-stand desk, sharp 4K screen and a full keyboard.",
    plan: "month",
    setup: normalizeSetup({
      deskId: "electrical-adjustable-desk",
      chairId: "ergonomic-office-chair",
      monitorIds: ["27-4-k-multimedia-monitor"],
      accessoryIds: ["ergonomic-laptop-stand", "logitech-mx-keyboard", "logitech-mx-master-mouse-s3"],
    }),
  },
  {
    id: "trading",
    title: "Trader",
    persona: "Markets never wait",
    description: "Three screens on the wide desk, with Starlink as backup.",
    plan: "month",
    setup: normalizeSetup({
      deskId: "dual-motor-electric-standing-desk",
      chairId: "ergonomic-office-chair",
      monitorIds: [
        "24-full-hd-office-monitor-a24i-2026",
        "27-4-k-multimedia-monitor",
        "24-full-hd-office-monitor-a24i-2026",
      ],
      accessoryIds: ["logitech-mx-keyboard", "logitech-mx-master-mouse-s3", "starlink-kit-incl-plan"],
    }),
  },
  {
    id: "studio",
    title: "Studio",
    persona: "Content creator",
    description: "5K display, 4K webcam and soft light for calls.",
    plan: "month",
    setup: normalizeSetup({
      deskId: "electrical-adjustable-desk",
      chairId: "concept-rattan-task-chair",
      monitorIds: ["apple-studio-display"],
      accessoryIds: [
        "logitech-4-k-webcam",
        "hue-signe-gradient-lamp",
        "logitech-mx-keyboard",
        "logitech-mx-master-mouse-s3",
        "concept-monstera-plant",
      ],
    }),
  },
];
