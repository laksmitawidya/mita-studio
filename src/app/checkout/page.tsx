import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CheckoutView } from "@/features/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Rent your setup",
  robots: { index: false },
};

function CheckoutSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]" aria-busy="true">
      <div className="flex flex-col gap-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-sunken" />
        <div className="h-40 animate-pulse rounded-3xl bg-sunken" />
        <div className="h-56 animate-pulse rounded-3xl bg-sunken" />
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-sunken" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <SiteHeader />
      {/* The setup comes from the URL, so this part renders on the client. */}
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutView />
      </Suspense>
    </main>
  );
}
