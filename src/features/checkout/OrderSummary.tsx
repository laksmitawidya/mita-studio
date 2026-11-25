import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { formatCents } from "@/domain/money";
import type { Quote } from "@/domain/pricing";

export function OrderSummary({ quote }: { quote: Quote }) {
  const unit = quote.plan === "week" ? "week" : "month";
  return (
    <section aria-labelledby="summary-heading" className="flex flex-col gap-4 rounded-3xl bg-surface p-5 ring-1 ring-line">
      <h2 id="summary-heading" className="font-display text-xl font-bold">
        Your setup
      </h2>
      <ul className="flex flex-col divide-y divide-line">
        {quote.lines.map(({ product, quantity, unitCents, lineCents }) => (
          <li key={product.id} className="flex items-center gap-3 py-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-line">
              <Image
                src={product.image}
                alt=""
                fill
                sizes="56px"
                className="object-contain p-1"
                unoptimized={product.image.endsWith(".svg")}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">
                {quantity > 1 && <span className="tabular-nums">{quantity} × </span>}
                {product.name}
              </p>
              <p className="text-xs text-ink-soft tabular-nums">
                {formatCents(unitCents)}/{unit}
                {product.url ? (
                  <>
                    {" · "}
                    <a href={product.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline-offset-2 hover:text-ink hover:underline">
                      monis.rent <ExternalLink className="size-3" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </>
                ) : (
                  " · concept item, price illustrative"
                )}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums">{formatCents(lineCents)}</p>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Per {unit}</dt>
          <dd className="tabular-nums">{formatCents(quote.perPeriodCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">Rental length</dt>
          <dd className="tabular-nums">
            {quote.periods} {unit}
            {quote.periods > 1 ? "s" : ""}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">Delivery</dt>
          <dd>Quoted by monis for your area</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <dt className="font-semibold">Rental total</dt>
          <dd className="font-display text-2xl font-bold tabular-nums" data-testid="checkout-total">
            {formatCents(quote.totalCents)}
          </dd>
        </div>
        {quote.monthlySavingCents > 0 && (
          <p className="text-right text-xs font-medium text-accent-strong">
            Monthly saves you {formatCents(quote.monthlySavingCents * quote.periods)} vs. weekly
          </p>
        )}
      </dl>
      <p className="text-xs text-ink-soft">A refundable deposit may apply. No payment is taken until monis confirms stock and delivery.</p>
    </section>
  );
}
