"use client";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { ModelSpec } from "@/domain/types";
import { useTheme } from "@/features/theme/theme";

/**
 * Low-poly models for the zones around the desk (coffee, outdoor, relax,
 * garage). Same conventions as models.tsx: origin on the floor, front is +z,
 * sizes in metres and roughly to scale.
 */

const matte = { roughness: 0.8, metalness: 0 } as const;
const metal = { roughness: 0.35, metalness: 0.6 } as const;

export function useNight() {
  return useTheme() === "dark";
}

function Box({
  size,
  position,
  color,
  radius = 0.01,
  rotation,
  material = matte,
  emissive,
  emissiveIntensity = 1,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  radius?: number;
  rotation?: [number, number, number];
  material?: { roughness: number; metalness: number };
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, ...size.map((s) => s / 2.01))}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} {...material} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? emissiveIntensity : 0} />
    </RoundedBox>
  );
}

function Cylinder({
  args,
  position,
  color,
  rotation,
  material = matte,
  emissive,
}: {
  args: [number, number, number, number?];
  position: [number, number, number];
  color: string;
  rotation?: [number, number, number];
  material?: { roughness: number; metalness: number };
  emissive?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[args[0], args[1], args[2], args[3] ?? 24]} />
      <meshStandardMaterial color={color} {...material} emissive={emissive ?? "#000000"} emissiveIntensity={emissive ? 1 : 0} />
    </mesh>
  );
}

/* ---------- Coffee station ---------- */

const COUNTER_H = 0.9;

function CoffeeCounter() {
  const night = useNight();
  return (
    <group>
      <Box size={[0.58, COUNTER_H - 0.04, 0.5]} position={[0, (COUNTER_H - 0.04) / 2, 0]} color="#c9a57e" radius={0.015} />
      <Box size={[0.6, 0.04, 0.54]} position={[0, COUNTER_H - 0.02, 0.01]} color="#f1ece3" radius={0.008} />
      <Box size={[0.006, 0.5, 0.004]} position={[0, 0.42, 0.252]} color="#b08a62" radius={0.002} />
      {/* Under-shelf LED: barely visible by day, a warm glow at night. */}
      <Box
        size={[0.5, 0.012, 0.02]}
        position={[0, COUNTER_H + 0.42, -0.22]}
        color="#fff1d6"
        radius={0.004}
        emissive="#ffcf87"
        emissiveIntensity={night ? 2.2 : 0.2}
      />
      <Box size={[0.58, 0.03, 0.22]} position={[0, COUNTER_H + 0.44, -0.15]} color="#c9a57e" radius={0.006} />
      {night && <pointLight position={[0, COUNTER_H + 0.3, 0]} intensity={1.4} distance={1.6} color="#ffcf87" />}
    </group>
  );
}

function CoffeeMachine({ style }: { style: "espresso" | "drip" }) {
  return (
    <group>
      <CoffeeCounter />
      <group position={[0, COUNTER_H, 0]}>
        {style === "espresso" ? (
          <>
            <Box size={[0.12, 0.22, 0.28]} position={[-0.08, 0.11, -0.02]} color="#9c2f2f" radius={0.025} />
            <Cylinder args={[0.032, 0.026, 0.07]} position={[0.12, 0.035, 0.08]} color="#f4f1ea" />
          </>
        ) : (
          <>
            <Box size={[0.2, 0.32, 0.22]} position={[-0.05, 0.16, -0.04]} color="#1f2322" radius={0.02} />
            <mesh position={[-0.05, 0.075, 0.07]}>
              <cylinderGeometry args={[0.06, 0.07, 0.14, 24]} />
              <meshPhysicalMaterial color="#d8eef0" transparent opacity={0.45} roughness={0.05} />
            </mesh>
            <Cylinder args={[0.035, 0.03, 0.08]} position={[0.16, 0.04, 0.08]} color="#0f7b6c" />
          </>
        )}
      </group>
    </group>
  );
}

/* ---------- Outdoor gear ---------- */

function Surfboard() {
  return (
    // Leaning against the wall behind it (towards -z).
    <group rotation={[-0.14, 0, 0]}>
      <mesh position={[0, 1.08, -0.08]} scale={[0.27, 1.08, 0.035]} castShadow>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color="#f4ead6" roughness={0.35} />
      </mesh>
      <Box size={[0.025, 2.0, 0.074]} position={[0, 1.08, -0.08]} color="#e0573f" radius={0.006} />
      <Box size={[0.4, 0.05, 0.074]} position={[0, 1.55, -0.08]} color="#0f7b6c" radius={0.01} />
    </group>
  );
}

function Wheel({ z }: { z: number }) {
  return (
    <group position={[0, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
      <Cylinder args={[0.22, 0.22, 0.1, 28]} position={[0, 0, 0]} color="#1b1d1c" />
      <Cylinder args={[0.12, 0.12, 0.11, 20]} position={[0, 0, 0]} color="#b9bec1" material={metal} />
    </group>
  );
}

function Motorbike() {
  const night = useNight();
  return (
    // Scooter, long axis along z, front wheel towards +z.
    <group>
      <Wheel z={0.62} />
      <Wheel z={-0.58} />
      <Box size={[0.32, 0.08, 0.7]} position={[0, 0.3, 0]} color="#2a2d2c" radius={0.02} />
      <Box size={[0.36, 0.42, 0.5]} position={[0, 0.48, -0.42]} color="#0f7b6c" radius={0.08} />
      <Box size={[0.3, 0.1, 0.52]} position={[0, 0.74, -0.36]} color="#3a2b22" radius={0.04} />
      <Box size={[0.34, 0.62, 0.12]} position={[0, 0.6, 0.42]} color="#0f7b6c" radius={0.05} rotation={[0.25, 0, 0]} />
      <Cylinder args={[0.025, 0.025, 0.7]} position={[0, 0.62, 0.6]} rotation={[0.35, 0, 0]} color="#3b403e" material={metal} />
      <Box size={[0.6, 0.035, 0.035]} position={[0, 0.96, 0.5]} color="#2a2d2c" radius={0.01} />
      <Cylinder
        args={[0.055, 0.05, 0.04]}
        position={[0, 0.88, 0.58]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#fff7e0"
        emissive={night ? "#fff2c4" : undefined}
      />
      {night && (
        <pointLight position={[0, 0.7, 0.95]} intensity={2.4} distance={2.2} color="#fff2c4" />
      )}
    </group>
  );
}

function PadelRacket() {
  return (
    <group rotation={[-0.22, 0, 0]}>
      <Cylinder args={[0.018, 0.018, 0.2]} position={[0, 0.1, -0.03]} color="#1f2322" />
      <mesh position={[0, 0.34, -0.03]} scale={[0.13, 0.15, 0.018]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 28]} />
        <meshStandardMaterial color="#e0573f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.34, -0.019]} rotation={[Math.PI / 2, 0, 0]} scale={[0.1, 1, 0.12]}>
        <cylinderGeometry args={[1, 1, 0.004, 28]} />
        <meshStandardMaterial color="#1f2322" roughness={0.6} />
      </mesh>
    </group>
  );
}

function ActionCam() {
  return (
    <group>
      <Box size={[0.42, 0.3, 0.32]} position={[0, 0.15, 0]} color="#b98a5a" radius={0.012} />
      {[0.08, 0.2].map((y) => (
        <Box key={y} size={[0.425, 0.02, 0.325]} position={[0, y, 0]} color="#9c7148" radius={0.004} />
      ))}
      <Box size={[0.07, 0.05, 0.035]} position={[0, 0.33, 0.04]} color="#1b1d1c" radius={0.008} />
      <Cylinder args={[0.014, 0.014, 0.01]} position={[0, 0.33, 0.06]} rotation={[Math.PI / 2, 0, 0]} color="#3d6fa8" />
    </group>
  );
}

/* ---------- Relax zone ---------- */

function TvWall() {
  const night = useNight();
  const screen = night ? "#5aa6ff" : "#2c3e50";
  return (
    <group>
      {/* Low media console */}
      <Box size={[1.3, 0.42, 0.4]} position={[0, 0.21, 0]} color="#b9875a" radius={0.02} />
      <Box size={[1.24, 0.006, 0.006]} position={[0, 0.21, 0.201]} color="#94683f" radius={0.002} />
      {/* 43" TV on its feet */}
      <Box size={[0.08, 0.05, 0.2]} position={[-0.38, 0.445, 0]} color="#1b1d1c" radius={0.01} />
      <Box size={[0.08, 0.05, 0.2]} position={[0.38, 0.445, 0]} color="#1b1d1c" radius={0.01} />
      <Box size={[0.97, 0.57, 0.04]} position={[0, 0.79, -0.02]} color="#111413" radius={0.01} />
      <mesh position={[0, 0.79, 0.001]}>
        <planeGeometry args={[0.93, 0.53]} />
        <meshStandardMaterial color="#0e1a24" emissive={screen} emissiveIntensity={night ? 1.4 : 0.35} roughness={0.3} />
      </mesh>
      <mesh position={[-0.12, 0.84, 0.003]}>
        <planeGeometry args={[0.4, 0.22]} />
        <meshBasicMaterial color={night ? "#ff9e6e" : "#d9b48a"} toneMapped={false} />
      </mesh>
      {night && <pointLight position={[0, 0.8, 0.45]} intensity={2.2} distance={2.6} color="#7db7ff" />}
    </group>
  );
}

function GameConsole() {
  const night = useNight();
  return (
    <group>
      <Box size={[0.1, 0.39, 0.26]} position={[0, 0.215, 0]} color="#f3f3f1" radius={0.03} />
      <Box size={[0.06, 0.37, 0.24]} position={[0, 0.215, 0]} color="#1b1d1c" radius={0.02} />
      <Box size={[0.012, 0.3, 0.004]} position={[0.032, 0.22, 0.131]} color="#9ccfff" radius={0.002} emissive="#5aa6ff" emissiveIntensity={night ? 3 : 0.6} />
      <Box size={[0.16, 0.02, 0.12]} position={[0, 0.01, 0]} color="#e2e2df" radius={0.006} />
    </group>
  );
}

function Speaker() {
  return (
    <group>
      <Box size={[0.07, 0.35, 0.07]} position={[-0.16, 0.175, 0]} color="#2a2d2c" radius={0.01} />
      <Box size={[0.07, 0.35, 0.07]} position={[0.16, 0.175, 0]} color="#2a2d2c" radius={0.01} />
      <Box size={[0.42, 0.34, 0.2]} position={[0, 0.52, 0]} color="#1b1d1c" radius={0.015} />
      <Box size={[0.38, 0.24, 0.005]} position={[0, 0.5, 0.101]} color="#2f2f2b" radius={0.003} />
      <Box size={[0.38, 0.03, 0.006]} position={[0, 0.65, 0.101]} color="#c8a96a" radius={0.002} material={metal} />
    </group>
  );
}

function BeanBag() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} scale={[0.48, 0.3, 0.46]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 20]} />
        <meshStandardMaterial color="#e0573f" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.34, -0.2]} scale={[0.42, 0.3, 0.2]} castShadow>
        <sphereGeometry args={[1, 28, 16]} />
        <meshStandardMaterial color="#d24c35" roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ---------- Garage space ---------- */

function Dumbbells() {
  const bell = (x: number) => (
    <group position={[x, 0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <Cylinder args={[0.016, 0.016, 0.36]} position={[0, 0, 0]} color="#b9bec1" material={metal} />
      <Cylinder args={[0.07, 0.07, 0.09]} position={[0, 0.12, 0]} color="#2a2d2c" />
      <Cylinder args={[0.07, 0.07, 0.09]} position={[0, -0.12, 0]} color="#2a2d2c" />
    </group>
  );
  return (
    <group>
      <Box size={[0.42, 0.24, 0.42]} position={[0, 0.12, 0]} color="#3b403e" radius={0.01} material={metal} />
      {bell(-0.09)}
      {bell(0.09)}
    </group>
  );
}

function WalkPad() {
  return (
    // Long axis along z.
    <group>
      <Box size={[0.56, 0.06, 1.25]} position={[0, 0.03, 0]} color="#2a2d2c" radius={0.02} />
      <Box size={[0.44, 0.008, 1.05]} position={[0, 0.064, -0.05]} color="#3e4441" radius={0.003} />
      <Box size={[0.56, 0.08, 0.12]} position={[0, 0.04, 0.57]} color="#1b1d1c" radius={0.02} />
    </group>
  );
}

function ToolShelf() {
  const shelves = [0.06, 0.55, 1.05, 1.55];
  return (
    <group>
      {[-0.43, 0.43].map((x) =>
        [-0.17, 0.17].map((z) => <Box key={`${x}${z}`} size={[0.035, 1.8, 0.035]} position={[x, 0.9, z]} color="#4a504d" material={metal} radius={0.004} />),
      )}
      {shelves.map((y) => (
        <Box key={y} size={[0.9, 0.03, 0.4]} position={[0, y, 0]} color="#c8a27a" radius={0.006} />
      ))}
      <Box size={[0.3, 0.22, 0.3]} position={[-0.22, 0.68, 0]} color="#e0573f" radius={0.015} />
      <Box size={[0.34, 0.18, 0.3]} position={[0.2, 0.66, 0]} color="#0f7b6c" radius={0.015} />
      <mesh position={[0.18, 1.2, 0]} scale={[0.14, 0.12, 0.16]} castShadow>
        <sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f2b84b" roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <Box size={[0.3, 0.14, 0.26]} position={[-0.2, 1.14, 0]} color="#9aa3a0" radius={0.01} />
      <Box size={[0.5, 0.1, 0.3]} position={[0, 0.13, 0]} color="#5b6360" radius={0.01} />
    </group>
  );
}

type ZoneSpec = Extract<
  ModelSpec,
  { kind: "coffee" | "surfboard" | "motorbike" | "padel" | "actionCam" | "tv" | "console" | "speaker" | "beanBag" | "dumbbells" | "walkPad" | "toolShelf" }
>;

export function ZoneModel({ spec }: { spec: ZoneSpec }) {
  switch (spec.kind) {
    case "coffee":
      return <CoffeeMachine style={spec.style} />;
    case "surfboard":
      return <Surfboard />;
    case "motorbike":
      return <Motorbike />;
    case "padel":
      return <PadelRacket />;
    case "actionCam":
      return <ActionCam />;
    case "tv":
      return <TvWall />;
    case "console":
      return <GameConsole />;
    case "speaker":
      return <Speaker />;
    case "beanBag":
      return <BeanBag />;
    case "dumbbells":
      return <Dumbbells />;
    case "walkPad":
      return <WalkPad />;
    case "toolShelf":
      return <ToolShelf />;
  }
}

export const ZONE_KINDS = new Set<ModelSpec["kind"]>([
  "coffee",
  "surfboard",
  "motorbike",
  "padel",
  "actionCam",
  "tv",
  "console",
  "speaker",
  "beanBag",
  "dumbbells",
  "walkPad",
  "toolShelf",
]);
