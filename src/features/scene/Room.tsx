"use client";

import { RoundedBox } from "@react-three/drei";
import { ROOM, ZONE_AREAS } from "@/domain/placement";
import type { ZoneId } from "@/domain/types";
import { useNight } from "./zone-models";

const WIDTH = ROOM.maxX - ROOM.minX;
const DEPTH = ROOM.frontZ - ROOM.backZ;
const CX = (ROOM.minX + ROOM.maxX) / 2;
const CZ = (ROOM.backZ + ROOM.frontZ) / 2;

/** Each zone's floor finish, so the areas read at a glance. */
const ZONE_FLOOR: Record<ZoneId, { color: string; night: string; round?: boolean }> = {
  coffee: { color: "#f3efe7", night: "#2a302d" },
  outdoor: { color: "#a77b52", night: "#3a2c20" },
  relax: { color: "#e9d3c0", night: "#3a2a26", round: true },
  garage: { color: "#c3c6c2", night: "#2b2f2e" },
};

function ZonePad({ zone, active }: { zone: ZoneId; active: boolean }) {
  const night = useNight();
  const { centre, size } = ZONE_AREAS[zone];
  const finish = ZONE_FLOOR[zone];
  const color = night ? finish.night : finish.color;
  const opacity = active ? 1 : 0.5;

  if (finish.round) {
    return (
      <mesh position={[centre[0], 0.008, centre[1]]} scale={[size[0] / 2 - 0.05, 1, size[1] / 2 - 0.05]} receiveShadow>
        <cylinderGeometry args={[1, 1, 0.012, 48]} />
        <meshStandardMaterial color={color} roughness={1} transparent opacity={opacity} />
      </mesh>
    );
  }
  return (
    <group>
      <RoundedBox args={[size[0] - 0.08, 0.014, size[1] - 0.08]} radius={0.006} position={[centre[0], 0.008, centre[1]]} receiveShadow>
        <meshStandardMaterial color={color} roughness={zone === "garage" ? 0.95 : 0.8} transparent opacity={opacity} />
      </RoundedBox>
      {zone === "outdoor" &&
        // Decking boards.
        Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[centre[0] - size[0] / 2 + 0.2 + i * ((size[0] - 0.4) / 8), 0.016, centre[1]]}>
            <boxGeometry args={[0.012, 0.004, size[1] - 0.12]} />
            <meshStandardMaterial color={night ? "#2a2018" : "#8a6440"} transparent opacity={opacity} />
          </mesh>
        ))}
    </group>
  );
}

/** A villa room on a plinth, open at the front and right like a cutaway. */
export function Room({ activeZones }: { activeZones: ReadonlySet<ZoneId> }) {
  const night = useNight();
  const wall = night ? "#1b2422" : "#f1ece3";
  const sideWall = night ? "#18201e" : "#e9e2d6";

  return (
    <group>
      {/* Plinth and floor */}
      <RoundedBox args={[WIDTH + 0.5, 0.24, DEPTH + 0.5]} radius={0.1} position={[CX, -0.13, CZ + 0.1]} receiveShadow>
        <meshStandardMaterial color={night ? "#141b19" : "#e4dccf"} roughness={0.9} />
      </RoundedBox>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CX, 0, CZ]} receiveShadow>
        <planeGeometry args={[WIDTH, DEPTH]} />
        <meshStandardMaterial color={night ? "#2c241c" : "#cfb08a"} roughness={0.85} />
      </mesh>

      {/* Rug under the desk */}
      <RoundedBox args={[2.9, 0.012, 2.0]} radius={0.005} position={[0, 0.006, 0.2]} receiveShadow>
        <meshStandardMaterial color={night ? "#2f3230" : "#ece4d4"} roughness={1} />
      </RoundedBox>

      {(Object.keys(ZONE_AREAS) as ZoneId[]).map((zone) => (
        <ZonePad key={zone} zone={zone} active={activeZones.has(zone)} />
      ))}

      {/* Back wall with window */}
      <mesh position={[CX, ROOM.wallHeight / 2, ROOM.backZ]} receiveShadow>
        <boxGeometry args={[WIDTH, ROOM.wallHeight, 0.08]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      <group position={[-0.9, 1.6, ROOM.backZ + 0.045]}>
        <mesh>
          <planeGeometry args={[1.3, 1.1]} />
          <meshBasicMaterial color={night ? "#16243a" : "#bfe3ea"} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.3, 0.001]}>
          <planeGeometry args={[1.3, 0.5]} />
          <meshBasicMaterial color={night ? "#0f1a16" : "#9fd0b4"} toneMapped={false} />
        </mesh>
        {night && (
          <mesh position={[0.34, 0.28, 0.002]}>
            <circleGeometry args={[0.09, 32]} />
            <meshBasicMaterial color="#f4efd8" toneMapped={false} />
          </mesh>
        )}
        {[-0.66, 0, 0.66].map((x) => (
          <mesh key={x} position={[x, 0, 0.01]}>
            <boxGeometry args={[0.04, 1.15, 0.03]} />
            <meshStandardMaterial color="#7b5a3e" />
          </mesh>
        ))}
        {[-0.56, 0.56].map((y) => (
          <mesh key={y} position={[0, y, 0.01]}>
            <boxGeometry args={[1.36, 0.04, 0.03]} />
            <meshStandardMaterial color="#7b5a3e" />
          </mesh>
        ))}
        {night && <pointLight position={[0, 0, 0.6]} intensity={0.6} distance={2.5} color="#8fb4ff" />}
      </group>

      {/* Left wall with an opening to the terrace */}
      <mesh position={[ROOM.minX, ROOM.wallHeight / 2, CZ - 0.6]} receiveShadow>
        <boxGeometry args={[0.08, ROOM.wallHeight, DEPTH - 1.2]} />
        <meshStandardMaterial color={sideWall} roughness={0.95} />
      </mesh>

      {/* Skirting */}
      <mesh position={[CX, 0.04, ROOM.backZ + 0.05]}>
        <boxGeometry args={[WIDTH, 0.08, 0.02]} />
        <meshStandardMaterial color={night ? "#232c29" : "#e2d9ca"} />
      </mesh>

      {/* Cove LED along the top of the back wall: a soft line by day, the room's glow at night. */}
      <mesh position={[CX, ROOM.wallHeight - 0.06, ROOM.backZ + 0.06]}>
        <boxGeometry args={[WIDTH - 0.1, 0.025, 0.02]} />
        <meshStandardMaterial
          color="#c9f5df"
          emissive="#38e08f"
          emissiveIntensity={night ? 2.4 : 0.15}
          toneMapped={!night}
        />
      </mesh>
      {night &&
        [-2.4, 0, 2.4].map((x) => (
          <pointLight key={x} position={[x, ROOM.wallHeight - 0.3, ROOM.backZ + 0.4]} intensity={1.1} distance={3.2} color="#4fe3a0" />
        ))}
    </group>
  );
}
