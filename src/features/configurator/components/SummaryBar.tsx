"use client";

import { Check, Link2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { formatCents } from "@/domain/money";
import { monthlySavingPercent, quote } from "@/domain/pricing";
import { encodeSetup } from "@/domain/share-code";
import { itemCount } from "@/domain/workspace";
import { useWorkspace } from "../store";
import { PlanToggle } from "./PlanToggle";

export function SummaryBar() {
  const { setup, plan, setPlan } = useWorkspace(useShallow((s) => ({ setup: s.setup, plan: s.plan, setPlan: s.setPlan })));
  const [copied, setCopied] = useState(false);

  const q = useMemo(() => quote(setup, plan), [setup, plan]);
  const saving = useMemo(() => monthlySavingPercent(setup), [setup]);
  const code = encodeSetup(setup);
  const checkoutHref = `/checkout?setup=${encodeURIComponent(code)}&plan=${plan}`;

  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.pathname = "/";
    url.search = new URLSearchParams({ setup: code, plan }).toString();
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url.toString());
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-[0_-8px_30px_-18px_rgb(0_0_0/0.3)] ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PlanToggle value={plan} onChange={setPlan} savingPercent={saving} />
        <span className="text-sm text-ink-soft tabular-nums">{itemCount(setup)} items</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <div>
          <p className="font-display text-base font-bold">Ready to rent?</p>
          <p className="font-display text-3xl font-bold whitespace-nowrap tabular-nums" data-testid="total" aria-live="polite">
            <span key={q.perPeriodCents} className="inline-block animate-pop">
              {formatCents(q.perPeriodCents)}
            </span>
            <span className="text-base font-medium text-ink-soft">/{plan === "week" ? "week" : "month"}</span>
          </p>
          {plan === "month" && q.monthlySavingCents > 0 && (
            <p className="text-[13px] font-medium text-accent-strong">
              You save {formatCents(q.monthlySavingCents)} vs. paying weekly
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-sunken hover:text-ink"
        >
          {copied ? <Check className="size-4 text-accent" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
          <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
        </button>
      </div>

      <Link
        href={checkoutHref}
        className="flex items-center justify-center rounded-full bg-accent px-5 py-3.5 text-base font-semibold text-white shadow-[0_8px_20px_-8px] shadow-accent/60 transition hover:-translate-y-0.5 hover:bg-accent-strong active:translate-y-0"
      >
        Rent this setup
      </Link>
      <p className="text-center text-xs text-ink-soft">Delivered and set up in Bali · free returns after your stay</p>
    </div>
  );
}
