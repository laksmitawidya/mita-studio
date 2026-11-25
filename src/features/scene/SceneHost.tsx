"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { getProduct } from "@/domain/catalog";
import { lineItems } from "@/domain/workspace";
import { useWorkspace } from "@/features/configurator/store";

function SceneSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center bg-sunken">
      <div className="flex flex-col items-center gap-3 text-ink-soft">
        <div className="size-10 animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />
        <p className="text-sm">Setting up your room…</p>
      </div>
    </div>
  );
}

const WorkspaceCanvas = dynamic(() => import("./WorkspaceCanvas"), {
  ssr: false,
  loading: SceneSkeleton,
});

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

let webglSupport: boolean | undefined;
const getWebGLSupport = () => (webglSupport ??= detectWebGL());
const noopSubscribe = () => () => {};

/** Shown when the device can't render WebGL: the same setup, as photos. */
function PhotoFallback() {
  const setup = useWorkspace((s) => s.setup);
  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-4">
      <p className="text-sm text-ink-soft">3D preview isn&apos;t available on this device. Here is your setup:</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {lineItems(setup).map(({ product, quantity }) => (
          <li key={product.id} className="rounded-xl bg-surface p-2 ring-1 ring-line">
            <Image
              src={product.image}
              alt=""
              width={240}
              height={240}
              className="aspect-square w-full rounded-lg object-contain"
              unoptimized={product.image.endsWith(".svg")}
            />
            <p className="mt-1 text-xs font-medium">
              {quantity > 1 ? `${quantity} × ` : ""}
              {product.name}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Text description of the scene for screen readers (the canvas is decorative). */
function SceneDescription() {
  const setup = useWorkspace((s) => s.setup);
  const desk = getProduct(setup.deskId);
  const chair = getProduct(setup.chairId);
  const others = lineItems(setup)
    .slice(2)
    .map(({ product, quantity }) => (quantity > 1 ? `${quantity} × ${product.name}` : product.name));
  return (
    <p className="sr-only" aria-live="polite">
      Preview: {desk.name} with {chair.name}
      {others.length ? `, plus ${others.join(", ")}` : ""}.
    </p>
  );
}

export function SceneHost() {
  const webgl = useSyncExternalStore(noopSubscribe, getWebGLSupport, () => true);
  return (
    <div className="relative h-full w-full" data-testid="scene">
      <SceneDescription />
      {webgl ? <WorkspaceCanvas /> : <PhotoFallback />}
    </div>
  );
}
