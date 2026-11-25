"use client";

import { SceneHost } from "@/features/scene/SceneHost";
import { CatalogPanel } from "./components/CatalogPanel";
import { PresetPicker } from "./components/PresetPicker";
import { QuickAdd } from "./components/QuickAdd";
import { SummaryBar } from "./components/SummaryBar";
import { Toast } from "./components/Toast";
import { ZonesSection } from "./components/ZonesSection";
import { useUrlSync } from "./use-url-sync";

/**
 * Desktop: catalog on the left, the room in the middle, quick adds and the
 * price on the right, and the zones around the desk below.
 * Phone: the room stays pinned on top while you scroll everything else, and
 * the price bar sticks to the bottom.
 */
export function Configurator() {
  useUrlSync();

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:h-[min(760px,calc(100dvh-10rem))] lg:min-h-[600px] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)_280px]">
        <div className="sticky top-0 z-10 -mx-4 h-[46dvh] overflow-hidden bg-canvas sm:mx-0 sm:rounded-3xl sm:ring-1 sm:ring-line lg:relative lg:order-2 lg:h-full">
          <SceneHost />
          <PresetPicker className="pointer-events-auto absolute top-3 left-3 right-16 hidden sm:flex" />
          <Toast />
        </div>

        <aside className="flex min-h-0 flex-col gap-4 lg:order-1 lg:overflow-hidden" aria-label="Catalog">
          <PresetPicker className="sm:hidden" />
          <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-1">
            <CatalogPanel />
          </div>
        </aside>

        <aside className="flex flex-col gap-4 lg:col-span-2 lg:order-3 xl:col-span-1 xl:min-h-0 xl:justify-between" aria-label="Quick add and price">
          <QuickAdd />
          <div className="sticky bottom-3 z-20 xl:static">
            <SummaryBar />
          </div>
        </aside>
      </div>

      <ZonesSection />
    </div>
  );
}
