"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { useWorkspace } from "../store";

const AUTO_DISMISS_MS = 6000;

export function Toast() {
  const notice = useWorkspace((s) => s.notice);
  const undo = useWorkspace((s) => s.undo);
  const dismiss = useWorkspace((s) => s.dismissNotice);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notice, dismiss]);

  return (
    <div aria-live="polite" className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
      {notice && (
        <div
          key={notice.id}
          role="status"
          className={cn(
            "pointer-events-auto flex max-w-md animate-toast items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg",
            notice.tone === "warning" ? "bg-ink text-white" : "bg-surface text-ink ring-1 ring-line",
          )}
        >
          {notice.tone === "warning" && <AlertTriangle className="size-4 shrink-0 text-sun" aria-hidden="true" />}
          <span>{notice.text}</span>
          {notice.undo && (
            <button type="button" onClick={undo} className="font-semibold text-accent underline-offset-2 hover:underline data-[tone=warning]:text-sun" data-tone={notice.tone}>
              Undo
            </button>
          )}
          <button type="button" onClick={dismiss} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
