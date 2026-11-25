"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import { memo, useState } from "react";
import type { Placement } from "@/domain/placement";
import { ProductModel } from "./models";

type Props = {
  placement: Placement;
  highlighted: boolean;
  reducedMotion: boolean;
  onSelect: (productId: string) => void;
  onHover: (productId: string | null) => void;
};

/**
 * One product in the room. It drops in with a spring when added, lifts on
 * hover, and opens its card in the list when clicked. The name and price label
 * is drawn by the page, not inside the canvas (see WorkspaceCanvas).
 */
function PlacedItemImpl({ placement, highlighted, reducedMotion, onSelect, onHover }: Props) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || highlighted;
  const isFurniture = placement.model.kind === "desk" || placement.model.kind === "chair";

  const { scale, lift } = useSpring({
    from: { scale: 0.6, lift: 0.5 },
    to: { scale: active && !isFurniture ? 1.06 : 1, lift: active ? 0.02 : 0 },
    config: { tension: 320, friction: 18 },
    immediate: reducedMotion,
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover(placement.product.id);
    document.body.style.cursor = "pointer";
  };
  const handleOut = () => {
    setHovered(false);
    onHover(null);
    document.body.style.cursor = "";
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(placement.product.id);
  };

  const [x, y, z] = placement.position;

  return (
    <animated.group
      position-x={x}
      position-y={lift.to((l) => y + l)}
      position-z={z}
      rotation-y={placement.rotationY}
      scale={scale}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      <ProductModel spec={placement.model} />
    </animated.group>
  );
}

export const PlacedItem = memo(PlacedItemImpl);
