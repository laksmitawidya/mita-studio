"use client";

import { CameraControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { LayoutGrid, Maximize2, ScanSearch } from "lucide-react";
import { useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { findProduct } from "@/domain/catalog";
import { formatCents } from "@/domain/money";
import { activeZones, layoutWorkspace } from "@/domain/placement";
import { unitPriceCents } from "@/domain/pricing";
import { useWorkspace } from "@/features/configurator/store";
import { useTheme } from "@/features/theme/theme";
import { usePrefersReducedMotion } from "@/lib/use-media-query";
import { PlacedItem } from "./PlacedItem";
import { Room } from "./Room";

type View = "overview" | "desk" | "top";

/** Camera position (x, y, z) then look-at target (x, y, z). */
const VIEWS: Record<View, [number, number, number, number, number, number]> = {
  overview: [7.0, 7.4, 10.6, 0, 0.3, 1.1],
  desk: [0.15, 1.3, 1.45, 0, 0.95, -0.15],
  top: [0.01, 13, 2.6, 0, 0, 1.1],
};

const DAY = { background: "#efe8dc", hemi: ["#fff7ea", "#c9b08f", 0.7], sun: 1.6, env: 1 } as const;
const NIGHT = { background: "#0b1210", hemi: ["#4a6a8c", "#1a130e", 0.32], sun: 0.35, env: 0.22 } as const;

/**
 * Name and price of the hovered item. Drawn as a normal DOM element over the
 * canvas rather than with drei <Html>: mounting a React root per hover inside
 * the scene raced React's own commits and crashed when items were added.
 */
function HoverLabel() {
  const { highlightedId, plan } = useWorkspace(useShallow((s) => ({ highlightedId: s.highlightedId, plan: s.plan })));
  const product = highlightedId ? findProduct(highlightedId) : undefined;
  if (!product) return null;
  return (
    <div
      role="status"
      className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-ink/90 px-3.5 py-1.5 text-xs text-canvas shadow-lg animate-toast"
    >
      <span className="font-semibold">{product.name}</span>
      <span className="tabular-nums opacity-80">
        {formatCents(unitPriceCents(product, plan))}/{plan === "week" ? "wk" : "mo"}
      </span>
    </div>
  );
}

export default function WorkspaceCanvas() {
  const controls = useRef<CameraControls>(null);
  const reducedMotion = usePrefersReducedMotion();
  const night = useTheme() === "dark";
  const mood = night ? NIGHT : DAY;

  const { setup, highlightedId } = useWorkspace(useShallow((s) => ({ setup: s.setup, highlightedId: s.highlightedId })));
  const focusProduct = useWorkspace((s) => s.focusProduct);
  const setHighlighted = useWorkspace((s) => s.setHighlighted);

  const placements = useMemo(() => layoutWorkspace(setup), [setup]);
  const zones = useMemo(() => activeZones(setup), [setup]);

  const goTo = (view: View) => {
    void controls.current?.setLookAt(...VIEWS[view], !reducedMotion);
  };

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop="demand"
        camera={{ position: VIEWS.overview.slice(0, 3) as [number, number, number], fov: 38, near: 0.1, far: 60 }}
        aria-hidden="true"
        onPointerMissed={() => setHighlighted(null)}
      >
        <color attach="background" args={[mood.background]} />
        <fog attach="fog" args={[mood.background, 16, 32]} />
        <hemisphereLight args={[mood.hemi[0], mood.hemi[1], mood.hemi[2]]} />
        <directionalLight
          position={night ? [-3, 6, 1] : [-3.5, 6, 3.5]}
          intensity={mood.sun}
          color={night ? "#9db8ff" : "#fff1d6"}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-bias={-0.0005}
        />
        <Environment resolution={128} environmentIntensity={mood.env}>
          <Lightformer intensity={1.2} position={[0, 4, 4]} scale={[8, 4, 1]} color="#fff5e6" />
          <Lightformer intensity={0.6} position={[-4, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#dff3f0" />
        </Environment>
        {/* Screens light the desk at night. */}
        {night && setup.monitorIds.length > 0 && (
          <pointLight position={[0, 1.05, 0.15]} intensity={1.8} distance={2.6} color="#7fb8ff" />
        )}

        <Room activeZones={zones} />

        {placements.map((placement) => (
          <PlacedItem
            key={placement.key}
            placement={placement}
            highlighted={highlightedId === placement.product.id}
            reducedMotion={reducedMotion}
            onSelect={focusProduct}
            onHover={setHighlighted}
          />
        ))}

        <ContactShadows position={[0, 0.02, 1.1]} scale={8} blur={2.4} opacity={night ? 0.55 : 0.32} far={1.6} resolution={512} />
        <CameraControls
          ref={controls}
          makeDefault
          minDistance={1}
          maxDistance={17}
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI / 2.1}
          minAzimuthAngle={-Math.PI / 2.4}
          maxAzimuthAngle={Math.PI / 2.4}
          onStart={() => setHighlighted(null)}
        />
      </Canvas>

      <HoverLabel />

      <div className="pointer-events-none absolute top-3 right-3 flex flex-col gap-2">
        {(
          [
            ["overview", "Whole room", Maximize2],
            ["desk", "Desk close-up", ScanSearch],
            ["top", "Top-down view", LayoutGrid],
          ] as const
        ).map(([view, label, Icon]) => (
          <button
            key={view}
            type="button"
            onClick={() => goTo(view)}
            className="pointer-events-auto grid size-10 place-items-center rounded-full bg-surface/90 text-ink shadow-sm ring-1 ring-line backdrop-blur transition hover:scale-105 hover:bg-surface"
            aria-label={label}
            title={label}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
