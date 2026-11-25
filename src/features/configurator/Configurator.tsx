"use client";

import { SceneHost } from "@/features/scene/SceneHost";
import { BuildTray } from "./components/BuildTray";
import { CatalogPanel } from "./components/CatalogPanel";
import { PresetPicker } from "./components/PresetPicker";
import { QuickAdd } from "./components/QuickAdd";
import { SummaryBar } from "./components/SummaryBar";
import { Toast } from "./components/Toast";
import { useUrlSync } from "./use-url-sync";

/**
 * Desktop: the room stays pinned in the middle (with the furnishing bar
 * docked under it) while the catalog on the left scrolls with the page; the
 * price stays pinned on the right.
 * Phone: the room is pinned to the top while you scroll everything else, and
 * the price bar sticks to the bottom.
 */
export function Configurator() {
  useUrlSync();

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)_280px]">
      <section
        aria-label="Your room"
        className="sticky top-0 z-10 -mx-4 flex h-[46dvh] flex-col gap-3 bg-canvas sm:mx-0 sm:h-[68dvh] lg:order-2 lg:top-3 lg:h-[calc(100dvh-8.5rem)] lg:min-h-[600px]"
      >
        <div className="relative min-h-0 flex-1 overflow-hidden sm:rounded-3xl sm:ring-1 sm:ring-line">
          <SceneHost />
          <PresetPicker overlay className="pointer-events-auto absolute top-3 left-3 right-16 hidden sm:flex" />
          <Toast />
        </div>
        <BuildTray className="hidden sm:flex" />
      </section>

      <aside className="flex flex-col gap-4 lg:order-1" aria-label="Catalog">
        <PresetPicker className="sm:hidden" />
        <BuildTray className="sm:hidden" />
        <CatalogPanel />
      </aside>

      <aside
        className="flex flex-col gap-4 lg:order-3 lg:col-span-2 xl:sticky xl:top-3 xl:col-span-1 xl:h-[calc(100dvh-8.5rem)] xl:min-h-[600px] xl:justify-between"
        aria-label="Quick add and price"
      >
        <QuickAdd />
        <div className="sticky bottom-3 z-20 xl:static">
          <SummaryBar />
        </div>
      </aside>
    </div>
  );
}
