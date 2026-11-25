"use client";

import { ExternalLink, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { formatCents } from "@/domain/money";
import { unitPriceCents } from "@/domain/pricing";
import type { PlanId, Product } from "@/domain/types";
import { cn } from "@/lib/cn";

type Control =
  | { type: "radio"; name: string; checked: boolean; onSelect: () => void }
  | { type: "checkbox"; checked: boolean; onToggle: () => void }
  | { type: "stepper"; count: number; onAdd: () => void; onRemove: () => void };

type Props = {
  product: Product;
  plan: PlanId;
  control: Control;
  highlighted: boolean;
  onHover: (productId: string | null) => void;
};

function PriceTag({ product, plan }: { product: Product; plan: PlanId }) {
  return (
    <p className="text-sm tabular-nums">
      <span className="font-semibold">{formatCents(unitPriceCents(product, plan))}</span>
      <span className="text-ink-soft">/{plan === "week" ? "week" : "month"}</span>
    </p>
  );
}

export function ProductCard({ product, plan, control, highlighted, onHover }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isOn = control.type === "stepper" ? control.count > 0 : control.checked;
  const inputId = `product-${product.id}`;

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlighted]);

  const body = (
    <>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-line">
        <Image
          src={product.image}
          alt=""
          fill
          sizes="80px"
          className="object-contain p-1.5"
          unoptimized={product.image.endsWith(".svg")}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium leading-snug">{product.name}</span>
          {product.source === "concept" && (
            <span
              className="rounded-full bg-sun/25 px-2 py-0.5 text-[11px] font-semibold text-ink"
              title="Not in the monis.rent catalog yet. Shown as a concept with an illustrative price."
            >
              Concept
            </span>
          )}
        </div>
        <p className="text-[13px] leading-snug text-ink-soft">{product.tagline}</p>
        <div className="flex flex-wrap items-center gap-x-2">
          <PriceTag product={product} plan={plan} />
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-xs text-ink-soft underline-offset-2 hover:text-ink hover:underline"
              aria-label={`${product.name} on monis.rent (opens in a new tab)`}
            >
              monis.rent
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={ref}
      onMouseEnter={() => onHover(product.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl bg-surface p-2.5 pr-3 ring-1 ring-line transition",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)]",
        isOn && "ring-2 ring-accent",
        highlighted && "animate-flash",
      )}
      data-testid={`card-${product.id}`}
    >
      {control.type === "stepper" ? (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
          <div className="flex flex-col items-center gap-1" role="group" aria-label={`${product.name} quantity`}>
            <button
              type="button"
              onClick={control.onAdd}
              className="grid size-8 place-items-center rounded-full bg-accent text-white transition hover:scale-110 hover:bg-accent-strong active:scale-95"
              aria-label={`Add ${product.name}`}
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
            <span className="text-sm font-semibold tabular-nums" aria-live="polite" aria-label={`${control.count} selected`}>
              {control.count}
            </span>
            <button
              type="button"
              onClick={control.onRemove}
              disabled={control.count === 0}
              className="grid size-8 place-items-center rounded-full bg-sunken text-ink transition enabled:hover:scale-110 disabled:opacity-40"
              aria-label={`Remove one ${product.name}`}
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </>
      ) : (
        <label htmlFor={inputId} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
          <input
            id={inputId}
            type={control.type}
            name={control.type === "radio" ? control.name : undefined}
            checked={control.checked}
            onChange={control.type === "radio" ? control.onSelect : control.onToggle}
            className="peer sr-only"
          />
          {body}
          <span
            aria-hidden="true"
            className={cn(
              "grid size-6 shrink-0 place-items-center border-2 transition",
              control.type === "radio" ? "rounded-full" : "rounded-md",
              isOn ? "animate-pop border-accent bg-accent" : "border-line bg-surface",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2",
            )}
          >
            {isOn && <span className={cn("bg-white", control.type === "radio" ? "size-2 rounded-full" : "h-2.5 w-1.5 -translate-y-px rotate-45 border-r-2 border-b-2 border-white bg-transparent")} />}
          </span>
        </label>
      )}
    </div>
  );
}
