"use client";

import { Check, Plus } from "lucide-react";
import Image from "next/image";
import { useShallow } from "zustand/react/shallow";
import { getProduct, productsIn } from "@/domain/catalog";
import { fitsOnDesk } from "@/domain/workspace";
import { cn } from "@/lib/cn";
import { useWorkspace } from "../store";

/** Cheapest screen that could still fit: what "Add monitor" reaches for. */
const STARTER_SCREEN = [...productsIn("monitor")].sort((a, b) => a.monthlyCents - b.monthlyCents)[0];

const TOGGLES = [
  { id: "concept-monstera-plant", label: "Place a plant" },
  { id: "smart-led-desk-lamp-1-s", label: "Add desk lamp" },
  { id: "nespresso-essenza-coffee-machine", label: "Add espresso" },
] as const;

function Tile({
  image,
  label,
  done,
  disabled,
  onClick,
  onHover,
  description,
}: {
  image: string;
  label: string;
  done: boolean;
  disabled?: boolean;
  onClick: () => void;
  onHover: (on: boolean) => void;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={done}
      aria-label={description}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-2xl border-[1.5px] p-2.5 text-xs font-semibold transition",
        "hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0",
        done ? "border-accent bg-accent-soft text-ink" : "border-dashed border-line bg-surface text-ink hover:border-accent",
      )}
    >
      <span className="relative block size-14 overflow-hidden rounded-xl bg-white">
        <Image src={image} alt="" fill sizes="56px" className="object-contain p-1" unoptimized={image.endsWith(".svg")} />
      </span>
      <span className="flex items-center gap-1">
        {done ? <Check className="size-3.5 text-accent" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
        {label}
      </span>
    </button>
  );
}

/** One-tap additions next to the room, as in the brief's sketch. */
export function QuickAdd() {
  const setup = useWorkspace((s) => s.setup);
  const { addMonitor, toggleAccessory, setHighlighted } = useWorkspace(
    useShallow((s) => ({ addMonitor: s.addMonitor, toggleAccessory: s.toggleAccessory, setHighlighted: s.setHighlighted })),
  );
  const canAddScreen = fitsOnDesk(setup.deskId, [...setup.monitorIds, STARTER_SCREEN.id]);
  const screens = setup.monitorIds.length;

  return (
    <section aria-labelledby="quick-add-title" className="flex flex-col gap-2">
      <h2 id="quick-add-title" className="px-1 text-[13px] font-semibold text-ink-soft">
        Quick add
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <Tile
          image={STARTER_SCREEN.image}
          label={screens ? `Add monitor (${screens})` : "Add monitor"}
          description={canAddScreen ? `Add a ${STARTER_SCREEN.name}` : "No room for another screen on this desk"}
          done={false}
          disabled={!canAddScreen}
          onClick={() => addMonitor(STARTER_SCREEN.id)}
          onHover={(on) => setHighlighted(on ? STARTER_SCREEN.id : null)}
        />
        {TOGGLES.map(({ id, label }) => {
          const product = getProduct(id);
          const done = setup.accessoryIds.includes(id);
          return (
            <Tile
              key={id}
              image={product.image}
              label={done ? "Added" : label}
              description={done ? `Remove ${product.name}` : `Add ${product.name}`}
              done={done}
              onClick={() => toggleAccessory(id)}
              onHover={(on) => setHighlighted(on ? id : null)}
            />
          );
        })}
      </div>
    </section>
  );
}
