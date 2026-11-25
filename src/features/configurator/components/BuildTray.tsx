"use client";

import { Bike, Check, Coffee, Plus, Sofa, Warehouse } from "lucide-react";
import Image from "next/image";
import { useShallow } from "zustand/react/shallow";
import { ZONES, productsInZone } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import { unitPriceCents } from "@/domain/pricing";
import type { ZoneId } from "@/domain/types";
import { cn } from "@/lib/cn";
import { useWorkspace } from "../store";

const ZONE_ICON: Record<ZoneId, typeof Coffee> = {
  coffee: Coffee,
  outdoor: Bike,
  relax: Sofa,
  garage: Warehouse,
};

/**
 * Furnishing bar docked under the room, like a life-sim build mode: pick a
 * zone, the camera glides to that corner, and its items sit right there to
 * drop in or take out.
 */
export function BuildTray({ className }: { className?: string }) {
  const { setup, plan, zoneTab, highlightedId } = useWorkspace(
    useShallow((s) => ({ setup: s.setup, plan: s.plan, zoneTab: s.zoneTab, highlightedId: s.highlightedId })),
  );
  const { toggleAccessory, setHighlighted, selectZone } = useWorkspace(
    useShallow((s) => ({ toggleAccessory: s.toggleAccessory, setHighlighted: s.setHighlighted, selectZone: s.selectZone })),
  );

  const zone = ZONES.find((z) => z.id === zoneTab)!;
  const items = productsInZone(zoneTab);
  const countIn = (id: ZoneId) => productsInZone(id).filter((p) => setup.accessoryIds.includes(p.id)).length;

  return (
    <section
      aria-label="Furnish the corners around your desk"
      className={cn("flex flex-col gap-2.5 rounded-2xl bg-surface p-3 ring-1 ring-line", className)}
    >
      <div className="flex items-center gap-2 overflow-x-auto" role="group" aria-label="Zones">
        <span className="hidden shrink-0 pr-1 text-[11px] font-semibold tracking-wide text-ink-soft uppercase 2xl:inline">Around your desk</span>
        {ZONES.map(({ id, title }) => {
          const Icon = ZONE_ICON[id];
          const active = id === zoneTab;
          const count = countIn(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectZone(id)}
              aria-pressed={active}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-[13px] font-semibold transition active:scale-95",
                active ? "bg-ink text-canvas" : "bg-sunken text-ink hover:bg-accent-soft",
              )}
            >
              <span className={cn("grid size-7 place-items-center rounded-full", active ? "bg-accent text-white" : "bg-surface text-accent")}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {title}
              {count > 0 && (
                <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[10px] text-white tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((product) => {
          const on = setup.accessoryIds.includes(product.id);
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggleAccessory(product.id)}
              onMouseEnter={() => setHighlighted(product.id)}
              onMouseLeave={() => setHighlighted(null)}
              onFocus={() => setHighlighted(product.id)}
              onBlur={() => setHighlighted(null)}
              aria-pressed={on}
              aria-label={`${on ? "Remove" : "Add"} ${product.name}, ${formatCents(unitPriceCents(product, plan))} per ${plan}`}
              className={cn(
                "group relative flex w-36 shrink-0 flex-col gap-1 rounded-xl border-[1.5px] p-1.5 text-left transition",
                "hover:-translate-y-0.5 active:scale-95",
                on ? "border-accent bg-accent-soft" : "border-dashed border-line hover:border-accent",
                highlightedId === product.id && "animate-flash",
              )}
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-white">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-contain p-1 transition group-hover:scale-105"
                  unoptimized={product.image.endsWith(".svg")}
                />
                {product.source === "concept" && (
                  <span
                    className="absolute top-1 left-1 rounded-full bg-sun px-1.5 py-0.5 text-[10px] font-semibold text-[#1d2421]"
                    title="Not in the monis.rent catalog yet. Shown as a concept with an illustrative price."
                  >
                    Concept
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1 right-1 grid size-6 place-items-center rounded-full shadow-sm transition",
                    on ? "bg-accent text-white" : "bg-surface text-ink group-hover:bg-accent group-hover:text-white",
                  )}
                >
                  {on ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                </span>
              </span>
              <span className="line-clamp-1 px-0.5 text-xs font-medium">{product.name}</span>
              <span className="px-0.5 text-[11px] text-ink-soft tabular-nums">
                {formatCents(unitPriceCents(product, plan))}/{plan === "week" ? "wk" : "mo"}
              </span>
            </button>
          );
        })}
        <p className="flex w-40 shrink-0 items-center px-2 text-xs text-ink-soft">{zone.blurb}</p>
      </div>
    </section>
  );
}
