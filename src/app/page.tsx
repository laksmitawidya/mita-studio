import { SiteHeader } from "@/components/SiteHeader";
import { Configurator } from "@/features/configurator/Configurator";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-6">
      <SiteHeader />
      <div className="mx-auto mb-4 max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Design your workspace</h1>
        <p className="mt-1 text-sm text-ink-soft sm:text-base">
          Pick a desk, chair and screens, set up the corners around it, then rent it all by the week or month.
        </p>
      </div>
      <Configurator />
    </main>
  );
}
