/** Bali is UTC+8 (WITA) with no daylight saving. */
const BALI_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** monis can still deliver next day for orders placed before this hour (Bali time). */
export const NEXT_DAY_CUTOFF_HOUR = 18;

export const BALI_AREAS = [
  "Canggu",
  "Pererenan",
  "Berawa",
  "Seminyak",
  "Kerobokan",
  "Ubud",
  "Uluwatu",
  "Bingin",
  "Jimbaran",
  "Sanur",
  "Denpasar",
  "Nusa Dua",
] as const;

export type BaliArea = (typeof BALI_AREAS)[number];

const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Earliest delivery date (YYYY-MM-DD, Bali calendar) for an order placed at `now`. */
export function earliestDeliveryDate(now: Date): string {
  const baliNow = now.getTime() + BALI_OFFSET_MS;
  const baliHour = new Date(baliNow).getUTCHours();
  const daysAhead = baliHour < NEXT_DAY_CUTOFF_HOUR ? 1 : 2;
  return isoDate(baliNow + daysAhead * DAY_MS);
}

/** Latest date we accept for a delivery request. */
export function latestDeliveryDate(now: Date): string {
  return isoDate(now.getTime() + BALI_OFFSET_MS + 90 * DAY_MS);
}
