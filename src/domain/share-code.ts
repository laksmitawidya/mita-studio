import { findProductByCode, getProduct } from "./catalog";
import type { PlanId, Setup } from "./types";
import { normalizeSetup } from "./workspace";

/**
 * Compact, human-readable setup code for links, e.g. `D2.C1.M27x2.KB.MS`.
 * Short enough to paste in a WhatsApp chat or read out to a monis agent.
 */
export function encodeSetup(setup: Setup): string {
  const codes: string[] = [getProduct(setup.deskId).code, getProduct(setup.chairId).code];

  const monitorRuns: [string, number][] = [];
  for (const id of setup.monitorIds) {
    const last = monitorRuns.at(-1);
    if (last && last[0] === id) last[1] += 1;
    else monitorRuns.push([id, 1]);
  }
  for (const [id, n] of monitorRuns) codes.push(getProduct(id).code + (n > 1 ? `x${n}` : ""));

  for (const id of setup.accessoryIds) codes.push(getProduct(id).code);
  return codes.join(".");
}

/** Matches an uppercased token such as `M27` or `M27X2`. */
const TOKEN = /^([A-Z0-9]+?)(?:X([1-3]))?$/;

/** Never throws: anything unknown is ignored and the result is normalized. */
export function decodeSetup(code: string | null | undefined): Setup | null {
  if (!code) return null;
  const draft: Partial<Setup> & { monitorIds: string[]; accessoryIds: string[] } = {
    monitorIds: [],
    accessoryIds: [],
  };
  let recognised = 0;

  for (const token of code.toUpperCase().split(".").slice(0, 40)) {
    const match = TOKEN.exec(token);
    if (!match) continue;
    const product = findProductByCode(match[1]);
    if (!product) continue;
    recognised += 1;
    const repeat = Number(match[2] ?? 1);

    switch (product.category) {
      case "desk":
        draft.deskId = product.id;
        break;
      case "chair":
        draft.chairId = product.id;
        break;
      case "monitor":
        for (let i = 0; i < repeat; i++) draft.monitorIds.push(product.id);
        break;
      default:
        draft.accessoryIds.push(product.id);
    }
  }
  return recognised ? normalizeSetup(draft) : null;
}

export function parsePlan(value: string | null | undefined): PlanId {
  return value === "month" ? "month" : "week";
}
