import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-10 flex max-w-[1440px] flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-6 text-xs text-ink-soft">
      <p>
        <span className="font-semibold text-ink">{BRAND.name}</span> · designed and built by {BRAND.author}
      </p>
      <p>
        Product names, prices and photos from{" "}
        <a className="underline underline-offset-2 hover:text-ink" href="https://monis.rent" target="_blank" rel="noreferrer">
          monis.rent
        </a>
        . Items marked Concept are illustrations.
      </p>
    </footer>
  );
}
