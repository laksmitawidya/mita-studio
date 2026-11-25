"use client";

import { Armchair, Coffee, Lamp, Monitor, Table2 } from "lucide-react";
import { type KeyboardEvent, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { getProduct, productsIn } from "@/domain/catalog";
import type { Category } from "@/domain/types";
import { MAX_MONITORS } from "@/domain/workspace";
import { cn } from "@/lib/cn";
import { useWorkspace } from "../store";
import { ProductCard } from "./ProductCard";

const TABS: { id: Category; label: string; icon: typeof Table2; hint: string }[] = [
  { id: "desk", label: "Desk", icon: Table2, hint: "All desks are sit-stand. Wider desks fit more screens." },
  { id: "chair", label: "Chair", icon: Armchair, hint: "The chair matters most on long days." },
  { id: "monitor", label: "Screens", icon: Monitor, hint: `Up to ${MAX_MONITORS} screens, as long as they fit the desk.` },
  { id: "accessory", label: "Gear", icon: Lamp, hint: "Lights, input devices and a camera for calls." },
  { id: "extra", label: "Extras", icon: Coffee, hint: "Things that make a villa work like an office." },
];

export function CatalogPanel() {
  const { setup, plan, activeTab, highlightedId } = useWorkspace(
    useShallow((s) => ({ setup: s.setup, plan: s.plan, activeTab: s.activeTab, highlightedId: s.highlightedId })),
  );
  const actions = useWorkspace(
    useShallow((s) => ({
      setActiveTab: s.setActiveTab,
      selectDesk: s.selectDesk,
      selectChair: s.selectChair,
      addMonitor: s.addMonitor,
      removeMonitor: s.removeMonitor,
      toggleAccessory: s.toggleAccessory,
      setHighlighted: s.setHighlighted,
    })),
  );
  const tabRefs = useRef<Partial<Record<Category, HTMLButtonElement | null>>>({});

  const countFor = (tab: Category): number => {
    switch (tab) {
      case "desk":
      case "chair":
        return 1;
      case "monitor":
        return setup.monitorIds.length;
      default:
        return setup.accessoryIds.filter((id) => getProduct(id).category === tab).length;
    }
  };

  const onTabKey = (e: KeyboardEvent) => {
    const index = TABS.findIndex((t) => t.id === activeTab);
    const next =
      e.key === "ArrowRight" ? (index + 1) % TABS.length
      : e.key === "ArrowLeft" ? (index - 1 + TABS.length) % TABS.length
      : e.key === "Home" ? 0
      : e.key === "End" ? TABS.length - 1
      : null;
    if (next === null) return;
    e.preventDefault();
    actions.setActiveTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  const tab = TABS.find((t) => t.id === activeTab)!;
  const products = productsIn(activeTab);

  return (
    <section aria-label="Choose your items" className="flex min-h-0 flex-col gap-3">
      <div role="tablist" aria-label="Categories" className="grid grid-cols-5 gap-1 rounded-2xl bg-sunken p-1" onKeyDown={onTabKey}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === activeTab;
          const count = countFor(id);
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[id] = el;
              }}
              role="tab"
              id={`tab-${id}`}
              aria-selected={selected}
              aria-controls="catalog-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => actions.setActiveTab(id)}
              className={cn(
                "relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-xs font-medium whitespace-nowrap transition",
                selected ? "bg-ink text-canvas shadow-sm" : "text-ink-soft hover:bg-surface hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
              {count > 0 && id !== "desk" && id !== "chair" && (
                <span className="absolute top-0.5 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div id="catalog-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="flex flex-col gap-2">
        <p className="px-1 text-[13px] text-ink-soft">{tab.hint}</p>
        <div
          className="flex flex-col gap-2"
          role={activeTab === "desk" || activeTab === "chair" ? "radiogroup" : undefined}
          aria-label={activeTab === "desk" || activeTab === "chair" ? `${tab.label} options` : undefined}
        >
          {products.map((product) => {
            const common = {
              product,
              plan,
              highlighted: highlightedId === product.id,
              onHover: actions.setHighlighted,
            };
            if (activeTab === "desk" || activeTab === "chair") {
              const checked = activeTab === "desk" ? setup.deskId === product.id : setup.chairId === product.id;
              const onSelect = () => (activeTab === "desk" ? actions.selectDesk(product.id) : actions.selectChair(product.id));
              return <ProductCard key={product.id} {...common} control={{ type: "radio", name: activeTab, checked, onSelect }} />;
            }
            if (activeTab === "monitor") {
              const count = setup.monitorIds.filter((id) => id === product.id).length;
              return (
                <ProductCard
                  key={product.id}
                  {...common}
                  control={{
                    type: "stepper",
                    count,
                    onAdd: () => actions.addMonitor(product.id),
                    onRemove: () => actions.removeMonitor(product.id),
                  }}
                />
              );
            }
            return (
              <ProductCard
                key={product.id}
                {...common}
                control={{
                  type: "checkbox",
                  checked: setup.accessoryIds.includes(product.id),
                  onToggle: () => actions.toggleAccessory(product.id),
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
