"use client";

import { Moon, Sun } from "lucide-react";
import { setTheme, useTheme } from "@/features/theme/theme";

/** Day/night switch. At night the room is lit by its own lamps and screens. */
export function ThemeToggle() {
  const theme = useTheme();
  const night = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(night ? "light" : "dark")}
      aria-pressed={night}
      className="flex h-9 items-center gap-1 rounded-full bg-sunken p-1 text-xs font-semibold ring-1 ring-line"
    >
      <span className="sr-only">Night mode</span>
      <span
        aria-hidden="true"
        className={`flex h-7 items-center gap-1 rounded-full px-2.5 transition ${night ? "text-ink-soft" : "bg-surface text-ink shadow-sm"}`}
      >
        <Sun className="size-3.5" /> Day
      </span>
      <span
        aria-hidden="true"
        className={`flex h-7 items-center gap-1 rounded-full px-2.5 transition ${night ? "bg-surface text-ink shadow-sm" : "text-ink-soft"}`}
      >
        <Moon className="size-3.5" /> Night
      </span>
    </button>
  );
}
