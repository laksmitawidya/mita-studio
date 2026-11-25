import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETUP } from "@/domain/workspace";
import { initialState, useWorkspace } from "./store";

const state = () => useWorkspace.getState();

beforeEach(() => {
  useWorkspace.setState(initialState);
});

describe("workspace store", () => {
  it("shows a warning and keeps the setup when a screen doesn't fit", () => {
    state().selectDesk("adjustable-wooden-desk");
    state().addMonitor("34-4-k-curved-monitor-180-hz");
    const before = state().setup;
    state().addMonitor("34-4-k-curved-monitor-180-hz");
    expect(state().setup).toBe(before);
    expect(state().notice).toMatchObject({ tone: "warning" });
  });

  it("offers undo after removing an accessory", () => {
    state().toggleAccessory("logitech-mx-keyboard");
    expect(state().setup.accessoryIds).not.toContain("logitech-mx-keyboard");
    expect(state().notice?.undo).toEqual(DEFAULT_SETUP);
    state().undo();
    expect(state().setup).toEqual(DEFAULT_SETUP);
    expect(state().notice).toBeNull();
  });

  it("loads a preset with its plan", () => {
    state().applyPreset("essentials");
    expect(state().setup.deskId).toBe("adjustable-wooden-desk");
    expect(state().plan).toBe("week");
  });

  it("opens the matching tab when an item is clicked in the scene", () => {
    state().focusProduct("starlink-kit-incl-plan");
    expect(state().activeTab).toBe("extra");
    expect(state().highlightedId).toBe("starlink-kit-incl-plan");
  });
});
