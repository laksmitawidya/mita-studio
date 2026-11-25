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

/** Short verb label for the add button, e.g. "Add surfboard". */
function addLabel(name: string) {
  const short = name.replace(/\s*\(.*\)$/, "").replace(/^(Sony|Logitech|Marshall|Bosch|Nespresso|Insta360)\s+/, "");
  return `Add ${short}`;
}

/**
 * The areas around the desk: coffee, outdoor gear, relaxing and garage.
 * Each item appears in its own corner of the room when added.
 */
export function ZonesSection() {
  const { setup, plan, highlightedId } = useWorkspace(
    useShallow((s) => ({ setup: s.setup, plan: s.plan, highlightedId: s.highlightedId })),
  );
  const { toggleAccessory, setHighlighted } = useWorkspace(
    useShallow((s) => ({ toggleAccessory: s.toggleAccessory, setHighlighted: s.setHighlighted })),
  );

  return (
    <section aria-labelledby="zones-title" className="flex flex-col gap-4" id="zones">
      <div className="flex flex-wrap items-end justify-between gap-2 px-1">
        <div>
          <h2 id="zones-title" className="font-display text-2xl font-bold tracking-tight">
            Around your desk
          </h2>
          <p className="text-sm text-ink-soft">Turn the villa into a home base. Everything you add shows up in its corner of the room.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ZONES.map((zone) => {
          const Icon = ZONE_ICON[zone.id];
          const items = productsInZone(zone.id);
          const added = items.filter((p) => setup.accessoryIds.includes(p.id)).length;
          return (
            <article
              key={zone.id}
              aria-labelledby={`zone-${zone.id}`}
              className={cn(
                "flex flex-col gap-3 rounded-3xl bg-surface p-4 ring-1 transition",
                added ? "ring-2 ring-accent" : "ring-line",
              )}
            >
              <header className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 id={`zone-${zone.id}`} className="font-display text-lg font-bold leading-tight">
                    {zone.title}
                  </h3>
                  <p className="text-xs text-ink-soft">{zone.blurb}</p>
                </div>
                {added > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums">{added}</span>
                )}
              </header>

              <ul className="grid grid-cols-2 gap-2">
                {items.map((product) => {
                  const on = setup.accessoryIds.includes(product.id);
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => toggleAccessory(product.id)}
                        onMouseEnter={() => setHighlighted(product.id)}
                        onMouseLeave={() => setHighlighted(null)}
                        onFocus={() => setHighlighted(product.id)}
                        onBlur={() => setHighlighted(null)}
                        aria-pressed={on}
                        className={cn(
                          "flex h-full w-full flex-col gap-1.5 rounded-2xl border-[1.5px] p-2 text-left transition",
                          "hover:-translate-y-0.5 active:scale-[0.97]",
                          on ? "border-accent bg-accent-soft" : "border-dashed border-line hover:border-accent",
                          highlightedId === product.id && "animate-flash",
                        )}
                      >
                        <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="(min-width: 1280px) 140px, 45vw"
                            className="object-contain p-1.5"
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
                        </span>
                        <span className="text-[13px] font-medium leading-snug">{product.name}</span>
                        <span className="mt-auto flex items-center justify-between gap-1 text-xs">
                          <span className="tabular-nums text-ink-soft">
                            {formatCents(unitPriceCents(product, plan))}/{plan === "week" ? "wk" : "mo"}
                          </span>
                          <span className={cn("flex items-center gap-0.5 font-semibold", on ? "text-accent" : "text-ink")}>
                            {on ? <Check className="size-3.5" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
                            <span className="sr-only">{on ? `Remove ${product.name}` : addLabel(product.name)}</span>
                            <span aria-hidden="true">{on ? "Added" : "Add"}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
