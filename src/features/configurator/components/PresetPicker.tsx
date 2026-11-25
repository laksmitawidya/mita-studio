"use client";

import { PRESETS } from "@/domain/presets";
import { encodeSetup } from "@/domain/share-code";
import { cn } from "@/lib/cn";
import { useWorkspace } from "../store";

export function PresetPicker({ className }: { className?: string }) {
  const applyPreset = useWorkspace((s) => s.applyPreset);
  const currentCode = useWorkspace((s) => encodeSetup(s.setup));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Start from a setup</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRESETS.map((preset) => {
          const active = encodeSetup(preset.setup) === currentCode;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              aria-pressed={active}
              title={preset.description}
              className={cn(
                "flex shrink-0 flex-col items-start rounded-2xl px-3.5 py-2 text-left ring-1 backdrop-blur transition hover:-translate-y-0.5",
                active ? "bg-ink text-canvas ring-ink" : "bg-surface/85 ring-line hover:bg-surface",
              )}
            >
              <span className="text-sm font-semibold">{preset.title}</span>
              <span className={cn("text-xs", active ? "opacity-75" : "text-ink-soft")}>{preset.persona}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
