import Link from "next/link";
import { CATALOG_SYNCED_AT } from "@/domain/catalog";
import { BRAND } from "@/lib/brand";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  const synced = new Date(`${CATALOG_SYNCED_AT}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <header className="flex h-14 items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name}, home`}>
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-xl bg-accent font-display text-lg leading-none font-extrabold text-white"
        >
          m
        </span>
        <span className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight">{BRAND.name}</span>
          <span className="hidden text-sm text-ink-soft sm:inline">by {BRAND.author}</span>
        </span>
      </Link>
      <div className="flex items-center gap-4">
        {children ?? (
          <p className="hidden text-right text-xs text-ink-soft md:block">
            Prices from{" "}
            <a className="underline underline-offset-2 hover:text-ink" href="https://monis.rent" target="_blank" rel="noreferrer">
              monis.rent
            </a>
            <span className="hidden sm:inline">, synced {synced}</span>
          </p>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
