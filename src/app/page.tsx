import { SiteHeader } from "@/components/SiteHeader";
import { Configurator } from "@/features/configurator/Configurator";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-6">
      <SiteHeader />
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Design your workspace</h1>
        <p className="text-sm text-ink-soft">
          Pick a desk, chair and screens, furnish the corners around it, then rent it all by the week or month.
        </p>
      </div>
      <Configurator />
    </main>
  );
}
