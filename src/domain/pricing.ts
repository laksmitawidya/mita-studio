import type { PlanId, Product, Setup } from "./types";
import { lineItems } from "./workspace";

export const PLANS: Record<PlanId, { label: string; unit: string; maxPeriods: number }> = {
  week: { label: "Weekly", unit: "week", maxPeriods: 12 },
  month: { label: "Monthly", unit: "month", maxPeriods: 12 },
};

/** monis bills monthly plans per 4 weeks; used to show the saving honestly. */
const WEEKS_PER_MONTH_PLAN = 4;

export function unitPriceCents(product: Product, plan: PlanId): number {
  return plan === "week" ? product.weeklyCents : product.monthlyCents;
}

export type QuoteLine = {
  product: Product;
  quantity: number;
  unitCents: number;
  lineCents: number;
};

export type Quote = {
  plan: PlanId;
  periods: number;
  lines: QuoteLine[];
  /** Price for one week or one month. */
  perPeriodCents: number;
  /** perPeriodCents × periods. */
  totalCents: number;
  /** Only for monthly: what four weekly payments would cost minus the monthly price. */
  monthlySavingCents: number;
};

export function quote(setup: Setup, plan: PlanId, periods = 1): Quote {
  if (!Number.isInteger(periods) || periods < 1 || periods > PLANS[plan].maxPeriods) {
    throw new RangeError(`periods must be an integer between 1 and ${PLANS[plan].maxPeriods}`);
  }
  const lines = lineItems(setup).map(({ product, quantity }) => {
    const unitCents = unitPriceCents(product, plan);
    return { product, quantity, unitCents, lineCents: unitCents * quantity };
  });
  const perPeriodCents = lines.reduce((sum, l) => sum + l.lineCents, 0);

  const weeklyEquivalent = lines.reduce((sum, l) => sum + l.product.weeklyCents * l.quantity, 0) * WEEKS_PER_MONTH_PLAN;
  const monthlySavingCents = plan === "month" ? Math.max(0, weeklyEquivalent - perPeriodCents) : 0;

  return { plan, periods, lines, perPeriodCents, totalCents: perPeriodCents * periods, monthlySavingCents };
}

/** Percentage saved by the monthly plan versus paying weekly for 4 weeks. */
export function monthlySavingPercent(setup: Setup): number {
  const weekly = quote(setup, "week").perPeriodCents * WEEKS_PER_MONTH_PLAN;
  const monthly = quote(setup, "month").perPeriodCents;
  return weekly === 0 ? 0 : Math.round(((weekly - monthly) / weekly) * 100);
}
