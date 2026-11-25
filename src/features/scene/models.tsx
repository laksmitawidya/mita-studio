"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { DESK_DEPTH, DESK_TOP_Y } from "@/domain/placement";
import type { ModelSpec } from "@/domain/types";
import { useNight, ZoneModel } from "./zone-models";

/**
 * Procedural low-poly models. Dimensions come from the catalog (desk width,
 * screen size), so what you see is to scale. Each model's local origin is
 * where it touches its surface (floor or desk top); "front" faces +z.
 */

const metal = { roughness: 0.35, metalness: 0.6 } as const;
const matte = { roughness: 0.8, metalness: 0 } as const;

function Box({
  size,
  position,
  color,
  radius = 0.008,
  rotation,
  material = matte,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  radius?: number;
  rotation?: [number, number, number];
  material?: { roughness: number; metalness: number };
}) {
  return (
    <RoundedBox args={size} radius={Math.min(radius, ...size.map((s) => s / 2.01))} smoothness={3} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color={color} {...material} />
    </RoundedBox>
  );
}

/* ---------- Desk ---------- */

function Desk({ spec }: { spec: Extract<ModelSpec, { kind: "desk" }> }) {
  const w = spec.widthCm / 100;
  const legX = w / 2 - 0.09;
  const topThickness = 0.035;
  const legHeight = DESK_TOP_Y - topThickness;

  const leg = (x: number) => {
    if (spec.style === "dualMotor") {
      // Three-stage lifting column.
      return (
        <group key={x} position={[x, 0, 0]}>
          <Box size={[0.07, 0.03, DESK_DEPTH - 0.08]} position={[0, 0.015, 0]} color={spec.frame} material={metal} />
          <Box size={[0.09, 0.26, 0.07]} position={[0, 0.16, 0]} color={spec.frame} material={metal} />
          <Box size={[0.08, 0.24, 0.06]} position={[0, 0.4, 0]} color={spec.frame} material={metal} />
          <Box size={[0.07, legHeight - 0.52, 0.05]} position={[0, 0.52 + (legHeight - 0.52) / 2, 0]} color={spec.frame} material={metal} />
        </group>
      );
    }
    const column = spec.style === "electric" ? 0.08 : 0.06;
    return (
      <group key={x} position={[x, 0, 0]}>
        <Box size={[0.06, 0.03, DESK_DEPTH - 0.06]} position={[0, 0.015, 0]} color={spec.frame} material={metal} />
        <Box size={[column, legHeight, column]} position={[0, legHeight / 2, 0]} color={spec.frame} material={metal} />
      </group>
    );
  };

  return (
    <group>
      <Box size={[w, topThickness, DESK_DEPTH]} position={[0, DESK_TOP_Y - topThickness / 2, 0]} color={spec.top} radius={0.012} />
      {leg(-legX)}
      {leg(legX)}
      <Box size={[w - 0.2, 0.04, 0.05]} position={[0, DESK_TOP_Y - 0.07, -0.15]} color={spec.frame} material={metal} />
      {spec.style === "mechanical" && (
        <mesh position={[legX - 0.05, DESK_TOP_Y - 0.09, 0.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.12, 12]} />
          <meshStandardMaterial color="#9a9a9a" {...metal} />
        </mesh>
      )}
      {spec.style !== "mechanical" && (
        <Box size={[0.12, 0.025, 0.05]} position={[-legX + 0.12, DESK_TOP_Y - 0.05, DESK_DEPTH / 2 - 0.04]} color="#2a2a2a" />
      )}
    </group>
  );
}

/* ---------- Chairs ---------- */

function OfficeChair() {
  const legs = Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2);
  return (
    <group>
      {legs.map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <Box size={[0.04, 0.03, 0.3]} position={[0, 0.07, 0.15]} color="#2b2d30" material={metal} />
          <mesh position={[0, 0.03, 0.29]} castShadow>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color="#111" {...matte} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.36, 16]} />
        <meshStandardMaterial color="#3a3a3a" {...metal} />
      </mesh>
      <Box size={[0.5, 0.08, 0.48]} position={[0, 0.48, 0]} color="#3b3f45" radius={0.03} />
      <Box size={[0.46, 0.56, 0.045]} position={[0, 0.82, -0.25]} rotation={[-0.12, 0, 0]} color="#2f3237" radius={0.03} />
      <Box size={[0.3, 0.12, 0.05]} position={[0, 1.17, -0.3]} rotation={[-0.12, 0, 0]} color="#2f3237" radius={0.025} />
      {[-0.27, 0.27].map((x) => (
        <group key={x}>
          <Box size={[0.03, 0.2, 0.03]} position={[x, 0.6, -0.02]} color="#2b2d30" material={metal} />
          <Box size={[0.07, 0.03, 0.24]} position={[x, 0.71, 0.0]} color="#1f2124" radius={0.012} />
        </group>
      ))}
    </group>
  );
}

function RattanChair() {
  const wood = "#8b5e3c";
  const weave = "#d2b07a";
  return (
    <group>
      {[
        [-0.21, -0.19],
        [0.21, -0.19],
        [-0.21, 0.19],
        [0.21, 0.19],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.018, 0.015, 0.44, 10]} />
          <meshStandardMaterial color={wood} {...matte} />
        </mesh>
      ))}
      <Box size={[0.5, 0.06, 0.46]} position={[0, 0.47, 0]} color={weave} radius={0.025} />
      <Box size={[0.48, 0.42, 0.04]} position={[0, 0.78, -0.22]} rotation={[-0.15, 0, 0]} color={weave} radius={0.03} />
      <Box size={[0.5, 0.035, 0.035]} position={[0, 1.0, -0.26]} color={wood} radius={0.015} />
      {[-0.23, 0.23].map((x) => (
        <Box key={x} size={[0.035, 0.035, 0.42]} position={[x, 0.66, 0]} color={wood} radius={0.015} />
      ))}
    </group>
  );
}

/* ---------- Monitors ---------- */

function ScreenContent({ width, height }: { width: number; height: number }) {
  const lines = [0.7, 0.45, 0.85, 0.3, 0.6];
  return (
    <group position={[0, 0, 0.002]}>
      {lines.map((len, i) => (
        <mesh key={i} position={[-width / 2 + 0.06 + (width * 0.6 * len) / 2, height / 2 - 0.06 - i * (height / 7), 0.001]}>
          <planeGeometry args={[width * 0.6 * len, height / 22]} />
          <meshBasicMaterial color={i % 2 ? "#7cc6b8" : "#e8d7a8"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Monitor({ spec }: { spec: Extract<ModelSpec, { kind: "monitor" }> }) {
  const width = spec.widthCm / 100;
  const height = (spec.inches * 2.54 * (spec.curved ? 0.39 : 0.49)) / 100;
  const centreY = 0.12 + height / 2;
  const night = useNight();
  const screenMaterial = (
    <meshStandardMaterial
      color="#0e1a24"
      emissive={night ? "#3b8fc0" : "#1f4b63"}
      emissiveIntensity={night ? 1.3 : 0.55}
      roughness={0.25}
      side={THREE.DoubleSide}
    />
  );

  const curve = useMemo(() => {
    const radius = 1.0;
    const theta = width / radius;
    return { radius, theta, start: Math.PI - theta / 2 };
  }, [width]);

  return (
    <group>
      <Box size={[0.24, 0.012, 0.16]} position={[0, 0.006, 0]} color={spec.bezel} material={metal} radius={0.006} />
      <Box size={[0.04, centreY, 0.025]} position={[0, centreY / 2, -0.05]} color={spec.bezel} material={metal} />
      {spec.curved ? (
        <group position={[0, centreY, -0.02]}>
          <mesh position={[0, 0, curve.radius]} castShadow>
            <cylinderGeometry args={[curve.radius, curve.radius, height, 48, 1, true, curve.start, curve.theta]} />
            {screenMaterial}
          </mesh>
        </group>
      ) : (
        <group position={[0, centreY, -0.02]}>
          <Box size={[width, height, 0.02]} position={[0, 0, -0.012]} color={spec.bezel} radius={0.006} />
          <mesh position={[0, 0, 0.0]}>
            <planeGeometry args={[width - 0.02, height - 0.02]} />
            {screenMaterial}
          </mesh>
          <ScreenContent width={width - 0.02} height={height - 0.02} />
        </group>
      )}
    </group>
  );
}

/* ---------- Desk accessories ---------- */

function ArmLamp() {
  const night = useNight();
  return (
    <group>
      <mesh position={[0, 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.024, 24]} />
        <meshStandardMaterial color="#f2f2f2" {...matte} />
      </mesh>
      <Box size={[0.018, 0.42, 0.018]} position={[0, 0.22, 0]} color="#e9e9e9" />
      <group position={[0, 0.43, 0]} rotation={[0, 0, 0]}>
        <Box size={[0.03, 0.022, 0.34]} position={[0, 0, 0.16]} color="#f2f2f2" />
        <mesh position={[0, -0.012, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.022, 0.28]} />
          <meshBasicMaterial color="#fff6dc" toneMapped={false} />
        </mesh>
        <pointLight position={[0, -0.08, 0.18]} intensity={night ? 3.2 : 0.8} distance={night ? 2.2 : 1.2} color="#ffe7b8" />
      </group>
    </group>
  );
}

function GradientLamp() {
  const night = useNight();
  return (
    <group>
      <mesh position={[0, 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 24]} />
        <meshStandardMaterial color="#1d1d1d" {...matte} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 12]} />
        <meshBasicMaterial color="#ff8a5c" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.24, 12]} />
        <meshBasicMaterial color="#a77bff" toneMapped={false} />
      </mesh>
      <pointLight position={[0.05, 0.35, 0.05]} intensity={night ? 2.6 : 0.6} distance={night ? 2.4 : 1.4} color="#ff9e7a" />
      {night && <pointLight position={[-0.05, 0.5, -0.05]} intensity={1.6} distance={2} color="#a77bff" />}
    </group>
  );
}

function Keyboard() {
  return (
    <group>
      <Box size={[0.43, 0.022, 0.13]} position={[0, 0.011, 0]} color="#2d2f33" radius={0.008} />
      <mesh position={[0, 0.0225, 0.005]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.39, 0.1]} />
        <meshStandardMaterial color="#4a4d53" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Mouse() {
  return (
    <mesh position={[0, 0.018, 0]} scale={[0.6, 0.38, 1]} castShadow>
      <sphereGeometry args={[0.06, 20, 16]} />
      <meshStandardMaterial color="#3a3d42" roughness={0.5} />
    </mesh>
  );
}

function LaptopStand() {
  const tilt = -0.32;
  return (
    <group>
      <Box size={[0.26, 0.012, 0.24]} position={[0, 0.07, 0]} rotation={[-tilt, 0, 0]} color="#c4c7cc" material={metal} />
      <Box size={[0.03, 0.11, 0.2]} position={[-0.1, 0.05, 0]} color="#b0b3b8" material={metal} />
      <Box size={[0.03, 0.11, 0.2]} position={[0.1, 0.05, 0]} color="#b0b3b8" material={metal} />
      {/* Customer's own laptop, drawn for context. */}
      <group position={[0, 0.085, 0.01]} rotation={[-tilt, 0, 0]}>
        <Box size={[0.31, 0.012, 0.22]} position={[0, 0, 0]} color="#d7d9dd" material={metal} />
        <group position={[0, 0.0, -0.11]} rotation={[-1.25 - tilt, 0, 0]}>
          <Box size={[0.31, 0.21, 0.008]} position={[0, 0.105, 0]} color="#d7d9dd" material={metal} />
          <mesh position={[0, 0.105, 0.005]}>
            <planeGeometry args={[0.28, 0.18]} />
            <meshStandardMaterial color="#0e1a24" emissive="#2a5a74" emissiveIntensity={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Webcam() {
  return (
    <group position={[0, 0.02, -0.01]}>
      <Box size={[0.1, 0.03, 0.035]} position={[0, 0.015, 0]} color="#1b1b1b" radius={0.012} />
      <mesh position={[0, 0.015, 0.019]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.004, 16]} />
        <meshStandardMaterial color="#284a6b" roughness={0.1} metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ---------- Floor items ---------- */

function Starlink() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.7, 12]} />
        <meshStandardMaterial color="#d9d9d9" {...metal} />
      </mesh>
      <Box size={[0.32, 0.02, 0.22]} position={[0, 0.02, 0]} color="#e6e6e6" />
      <Box size={[0.5, 0.31, 0.03]} position={[0, 0.82, 0]} rotation={[-0.5, 0, 0]} color="#f4f4f4" radius={0.02} />
    </group>
  );
}

function Purifier() {
  return (
    <group>
      <mesh position={[0, 0.27, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.54, 32]} />
        <meshStandardMaterial color="#f5f5f2" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.545, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.01, 32]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Plant() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        angle: (i / 9) * Math.PI * 2 + (i % 2) * 0.3,
        height: 0.55 + (i % 3) * 0.18,
        tilt: 0.5 + (i % 3) * 0.15,
        size: 0.2 + (i % 2) * 0.05,
      })),
    [],
  );
  return (
    <group>
      <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.13, 0.34, 24]} />
        <meshStandardMaterial color="#e9e4da" roughness={0.7} />
      </mesh>
      {leaves.map((leaf, i) => (
        <group key={i} rotation={[0, leaf.angle, 0]}>
          <mesh position={[0, (0.34 + leaf.height) / 2, 0.04]} rotation={[0.15, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.008, leaf.height - 0.34, 6]} />
            <meshStandardMaterial color="#3f6b3a" {...matte} />
          </mesh>
          <mesh position={[0, leaf.height, 0.12]} rotation={[leaf.tilt, 0, 0]} scale={[leaf.size, 0.012, leaf.size * 0.85]} castShadow>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color={i % 2 ? "#2f6b3f" : "#3c7d4a"} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function ProductModel({ spec }: { spec: ModelSpec }) {
  switch (spec.kind) {
    case "desk":
      return <Desk spec={spec} />;
    case "chair":
      return spec.style === "rattan" ? <RattanChair /> : <OfficeChair />;
    case "monitor":
      return <Monitor spec={spec} />;
    case "lamp":
      return spec.style === "arm" ? <ArmLamp /> : <GradientLamp />;
    case "keyboard":
      return <Keyboard />;
    case "mouse":
      return <Mouse />;
    case "laptopStand":
      return <LaptopStand />;
    case "webcam":
      return <Webcam />;
    case "starlink":
      return <Starlink />;
    case "purifier":
      return <Purifier />;
    case "plant":
      return <Plant />;
    default:
      return <ZoneModel spec={spec} />;
  }
}

