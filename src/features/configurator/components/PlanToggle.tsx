"use client";

import { PLANS } from "@/domain/pricing";
import type { PlanId } from "@/domain/types";
import { cn } from "@/lib/cn";

type Props = {
  value: PlanId;
  onChange: (plan: PlanId) => void;
  savingPercent: number;
};

export function PlanToggle({ value, onChange, savingPercent }: Props) {
  return (
    <fieldset className="flex rounded-full bg-sunken p-1">
      <legend className="sr-only">Billing plan</legend>
      {(Object.keys(PLANS) as PlanId[]).map((plan) => (
        <label
          key={plan}
          className={cn(
            "relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
            value === plan ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink",
            "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
          )}
        >
          <input
            type="radio"
            name="plan"
            value={plan}
            checked={value === plan}
            onChange={() => onChange(plan)}
            className="sr-only"
          />
          {PLANS[plan].label}
          {plan === "month" && savingPercent > 0 && (
            <span className="rounded-full bg-coral px-1.5 py-0.5 text-[11px] font-semibold text-white">−{savingPercent}%</span>
          )}
        </label>
      ))}
    </fieldset>
  );
}
