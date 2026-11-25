"use client";

import { ArrowLeft, CalendarCheck, CheckCircle2, MessageCircle, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useMemo, useState } from "react";
import { submitRentalRequest, type RentalRequestState } from "@/app/checkout/actions";
import { BALI_AREAS, earliestDeliveryDate, latestDeliveryDate } from "@/domain/delivery";
import { formatCents } from "@/domain/money";
import { PLANS, monthlySavingPercent, quote } from "@/domain/pricing";
import { decodeSetup, encodeSetup, parsePlan } from "@/domain/share-code";
import type { PlanId } from "@/domain/types";
import { DEFAULT_SETUP } from "@/domain/workspace";
import { PlanToggle } from "@/features/configurator/components/PlanToggle";
import { cn } from "@/lib/cn";
import type { FieldName } from "./schema";
import { OrderSummary } from "./OrderSummary";

const initialState: RentalRequestState = { status: "idle" };

function Field({
  name,
  label,
  error,
  hint,
  className,
  children,
}: {
  name: FieldName;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; className: string }) => React.ReactNode;
}) {
  const id = `field-${name}`;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
        className: cn(
          "w-full rounded-xl bg-surface px-3.5 py-2.5 text-[15px] ring-1 ring-line transition outline-none",
          "focus:ring-2 focus:ring-accent",
          error && "ring-2 ring-coral",
        ),
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-coral">
          {error}
        </p>
      )}
    </div>
  );
}

function Confirmation({ state }: { state: Extract<RentalRequestState, { status: "success" }> }) {
  const unit = PLANS[state.plan].unit;
  const message = encodeURIComponent(
    `Hi monis! I'd like to rent this workspace setup.\nRequest: ${state.reference}\nSetup code: ${state.setupCode}\n` +
      `${state.periods} ${unit}(s), delivery ${state.deliveryDate} in ${state.area}.`,
  );
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 py-10 text-center" role="status">
      <CheckCircle2 className="size-14 animate-pop text-accent" aria-hidden="true" />
      <h1 className="font-display text-3xl font-bold">Thanks, {state.name.split(" ")[0]}! Your setup is requested.</h1>
      <p className="text-ink-soft">
        Request <strong className="font-semibold text-ink">{state.reference}</strong> · {formatCents(state.totalCents)} for {state.periods}{" "}
        {unit}
        {state.periods > 1 ? "s" : ""}
      </p>
      <ol className="flex w-full flex-col gap-3 rounded-3xl bg-surface p-5 text-left ring-1 ring-line">
        <li className="flex gap-3">
          <MessageCircle className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <span>monis confirms stock and the delivery fee for {state.area} on WhatsApp.</span>
        </li>
        <li className="flex gap-3">
          <Truck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <span>Your setup arrives on {new Date(`${state.deliveryDate}T00:00:00`).toDateString()} and is assembled for you.</span>
        </li>
        <li className="flex gap-3">
          <CalendarCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
          <span>Moving villas or extending? Share code <code className="rounded bg-sunken px-1.5 py-0.5 text-sm">{state.setupCode}</code> and they rebuild it.</span>
        </li>
      </ol>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={`https://wa.me/?text=${message}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong"
        >
          Share request on WhatsApp
        </a>
        <Link href={`/?setup=${state.setupCode}&plan=${state.plan}`} className="rounded-full px-5 py-3 font-semibold ring-1 ring-line hover:bg-sunken">
          Back to my setup
        </Link>
      </div>
      <p className="text-xs text-ink-soft">This is a prototype: no request was sent and no payment was taken.</p>
    </div>
  );
}

export function CheckoutView() {
  const params = useSearchParams();
  const setup = useMemo(() => decodeSetup(params.get("setup")) ?? DEFAULT_SETUP, [params]);
  const [plan, setPlan] = useState<PlanId>(() => parsePlan(params.get("plan")));
  const [periods, setPeriods] = useState(plan === "week" ? 2 : 1);
  const [state, formAction, pending] = useActionState(submitRentalRequest, initialState);

  const [dateBounds] = useState(() => {
    const now = new Date();
    return { min: earliestDeliveryDate(now), max: latestDeliveryDate(now) };
  });

  const q = useMemo(() => quote(setup, plan, periods), [setup, plan, periods]);
  const code = encodeSetup(setup);

  if (state.status === "success") return <Confirmation state={state} />;

  const errors = state.status === "error" ? state.fieldErrors : {};
  const values = state.status === "error" ? state.values : {};
  const maxPeriods = PLANS[plan].maxPeriods;

  const changePlan = (next: PlanId) => {
    setPlan(next);
    setPeriods((p) => Math.min(p, PLANS[next].maxPeriods));
  };

  return (
    <div className="grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <form action={formAction} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-2">
          <Link href={`/?setup=${code}&plan=${plan}`} className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to designer
          </Link>
          <h1 className="font-display text-3xl font-bold">Rent your setup</h1>
          <p className="text-ink-soft">Tell us how long and where. monis confirms everything on WhatsApp before you pay.</p>
        </div>

        {state.status === "error" && (
          <p role="alert" className="rounded-2xl bg-coral-soft px-4 py-3 text-sm font-medium text-ink">
            {state.message}
          </p>
        )}

        <input type="hidden" name="setup" value={code} />
        <input type="hidden" name="plan" value={plan} />
        <input type="hidden" name="periods" value={periods} />

        <fieldset className="flex flex-col gap-4 rounded-3xl bg-surface p-5 ring-1 ring-line">
          <legend className="sr-only">Rental length</legend>
          <h2 className="font-display text-lg font-bold" aria-hidden="true">
            1 · How long?
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <PlanToggle value={plan} onChange={changePlan} savingPercent={monthlySavingPercent(setup)} />
            <div className="flex items-center gap-2" role="group" aria-label="Number of periods">
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full bg-sunken text-lg font-semibold disabled:opacity-40"
                onClick={() => setPeriods((p) => Math.max(1, p - 1))}
                disabled={periods <= 1}
                aria-label={`One ${PLANS[plan].unit} less`}
              >
                −
              </button>
              <span className="min-w-24 text-center font-semibold tabular-nums" aria-live="polite" data-testid="periods">
                {periods} {PLANS[plan].unit}
                {periods > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full bg-sunken text-lg font-semibold disabled:opacity-40"
                onClick={() => setPeriods((p) => Math.min(maxPeriods, p + 1))}
                disabled={periods >= maxPeriods}
                aria-label={`One ${PLANS[plan].unit} more`}
              >
                +
              </button>
            </div>
          </div>
          {errors.periods && <p className="text-xs font-medium text-coral">{errors.periods}</p>}
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl bg-surface p-5 ring-1 ring-line sm:grid-cols-2">
          <legend className="sr-only">Delivery</legend>
          <h2 className="font-display text-lg font-bold sm:col-span-2" aria-hidden="true">
            2 · Where and when?
          </h2>
          <Field name="area" label="Area" error={errors.area}>
            {(p) => (
              <select {...p} name="area" defaultValue={values.area ?? ""} required>
                <option value="" disabled>
                  Choose your area
                </option>
                {BALI_AREAS.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>
            )}
          </Field>
          <Field name="deliveryDate" label="Delivery date" error={errors.deliveryDate} hint="Next-day delivery when you order before 18:00 Bali time.">
            {(p) => <input {...p} type="date" name="deliveryDate" min={dateBounds.min} max={dateBounds.max} defaultValue={values.deliveryDate ?? dateBounds.min} required />}
          </Field>
          <Field name="address" label="Villa or street address" error={errors.address} className="sm:col-span-2">
            {(p) => <input {...p} name="address" autoComplete="street-address" placeholder="Villa Kayu, Jl. Pantai Batu Bolong 12" defaultValue={values.address} required />}
          </Field>
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl bg-surface p-5 ring-1 ring-line sm:grid-cols-2">
          <legend className="sr-only">Contact</legend>
          <h2 className="font-display text-lg font-bold sm:col-span-2" aria-hidden="true">
            3 · How do we reach you?
          </h2>
          <Field name="name" label="Full name" error={errors.name}>
            {(p) => <input {...p} name="name" autoComplete="name" defaultValue={values.name} required />}
          </Field>
          <Field name="email" label="Email" error={errors.email}>
            {(p) => <input {...p} type="email" name="email" autoComplete="email" defaultValue={values.email} required />}
          </Field>
          <Field name="whatsapp" label="WhatsApp number" error={errors.whatsapp} hint="With country code, e.g. +62 or +49.">
            {(p) => <input {...p} type="tel" name="whatsapp" autoComplete="tel" placeholder="+62 812 3456 7890" defaultValue={values.whatsapp} required />}
          </Field>
          <Field name="notes" label="Notes (optional)" error={errors.notes}>
            {(p) => <input {...p} name="notes" placeholder="Gate code, best time to deliver…" defaultValue={values.notes} />}
          </Field>
        </fieldset>

        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-semibold text-white transition hover:bg-accent-strong disabled:opacity-60 lg:w-fit"
        >
          {pending ? "Sending request…" : `Request this setup · ${formatCents(q.totalCents)}`}
        </button>
      </form>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <OrderSummary quote={q} />
      </div>
    </div>
  );
}
