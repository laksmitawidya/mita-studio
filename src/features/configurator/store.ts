import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProduct } from "@/domain/catalog";
import { PRESETS } from "@/domain/presets";
import type { Category, PlanId, Setup } from "@/domain/types";
import * as ws from "@/domain/workspace";

export type Notice = {
  id: number;
  tone: "info" | "warning";
  text: string;
  /** When set, the toast offers Undo and restores this setup. */
  undo?: Setup;
};

type State = {
  setup: Setup;
  plan: PlanId;
  activeTab: Category;
  /** Product highlighted in both the list and the 3D scene. */
  highlightedId: string | null;
  notice: Notice | null;
};

type Actions = {
  selectDesk: (id: string) => void;
  selectChair: (id: string) => void;
  addMonitor: (id: string) => void;
  removeMonitor: (id: string) => void;
  toggleAccessory: (id: string) => void;
  applyPreset: (presetId: string) => void;
  replaceSetup: (setup: Setup, plan?: PlanId) => void;
  setPlan: (plan: PlanId) => void;
  setActiveTab: (tab: Category) => void;
  /** Called when an item is clicked in the 3D scene. */
  focusProduct: (productId: string) => void;
  setHighlighted: (productId: string | null) => void;
  undo: () => void;
  dismissNotice: () => void;
};

export type WorkspaceStore = State & Actions;

let noticeId = 0;
const notice = (text: string, tone: Notice["tone"] = "info", undo?: Setup): Notice => ({
  id: ++noticeId,
  tone,
  text,
  undo,
});

export const initialState: State = {
  setup: ws.DEFAULT_SETUP,
  plan: "month",
  activeTab: "desk",
  highlightedId: null,
  notice: null,
};

export const useWorkspace = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      selectDesk: (id) => {
        const before = get().setup;
        const result = ws.selectDesk(before, id);
        if (!result.ok) return set({ notice: notice(result.reason, "warning") });
        const removed = result.removed ?? [];
        set({
          setup: result.value,
          notice: removed.length
            ? notice(`Removed ${removed.map((p) => p.name).join(", ")}: not enough room on this desk.`, "warning", before)
            : null,
        });
      },

      selectChair: (id) => {
        const result = ws.selectChair(get().setup, id);
        set(result.ok ? { setup: result.value } : { notice: notice(result.reason, "warning") });
      },

      addMonitor: (id) => {
        const result = ws.addMonitor(get().setup, id);
        set(result.ok ? { setup: result.value, notice: null } : { notice: notice(result.reason, "warning") });
      },

      removeMonitor: (id) => {
        const before = get().setup;
        set({ setup: ws.removeOneMonitor(before, id), notice: notice(`Removed ${getProduct(id).name}.`, "info", before) });
      },

      toggleAccessory: (id) => {
        const before = get().setup;
        const result = ws.toggleAccessory(before, id);
        if (!result.ok) return set({ notice: notice(result.reason, "warning") });
        const removed = before.accessoryIds.includes(id);
        set({
          setup: result.value,
          notice: removed ? notice(`Removed ${getProduct(id).name}.`, "info", before) : null,
        });
      },

      applyPreset: (presetId) => {
        const preset = PRESETS.find((p) => p.id === presetId);
        if (!preset) return;
        const before = get().setup;
        set({
          setup: preset.setup,
          plan: preset.plan,
          notice: notice(`Loaded the ${preset.title} setup.`, "info", before),
        });
      },

      replaceSetup: (setup, plan) => set({ setup: ws.normalizeSetup(setup), ...(plan ? { plan } : {}) }),

      setPlan: (plan) => set({ plan }),

      setActiveTab: (activeTab) => set({ activeTab }),

      focusProduct: (productId) => {
        const product = getProduct(productId);
        // Zone items live in the zone cards below the room, not in a catalog tab.
        if (product.category === "zone") return set({ highlightedId: productId });
        set({ activeTab: product.category, highlightedId: productId });
      },

      setHighlighted: (highlightedId) => set({ highlightedId }),

      undo: () => {
        const previous = get().notice?.undo;
        if (previous) set({ setup: previous, notice: null });
      },

      dismissNotice: () => set({ notice: null }),
    }),
    {
      name: "monis-workspace",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ setup: state.setup, plan: state.plan }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<State> | undefined;
        return {
          ...current,
          setup: saved?.setup ? ws.normalizeSetup(saved.setup) : current.setup,
          plan: saved?.plan === "week" ? "week" : current.plan,
        };
      },
      // Rehydrated manually after mount so server and first client render match.
      skipHydration: true,
    },
  ),
);
