"use client";

import { useEffect } from "react";
import { decodeSetup, encodeSetup, parsePlan } from "@/domain/share-code";
import { useWorkspace } from "./store";

/**
 * Keeps the address bar in sync with the setup so any moment is shareable.
 * Priority on load: share link in the URL, then the saved setup, then default.
 * Uses history.replaceState: no navigation, no re-render of server components.
 */
export function useUrlSync() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = decodeSetup(params.get("setup"));

    if (shared) {
      useWorkspace.getState().replaceSetup(shared, parsePlan(params.get("plan")));
    } else {
      void useWorkspace.persist.rehydrate();
    }

    const write = () => {
      const { setup, plan } = useWorkspace.getState();
      const url = new URL(window.location.href);
      url.searchParams.set("setup", encodeSetup(setup));
      url.searchParams.set("plan", plan);
      window.history.replaceState(window.history.state, "", url);
    };

    write();
    return useWorkspace.subscribe((state, prev) => {
      if (state.setup !== prev.setup || state.plan !== prev.plan) write();
    });
  }, []);
}
