import React from "react";
import { Grid as DreiGrid } from "@react-three/drei";
import store from "../settings/store";

export default function Grid() {
  const grid = store.grid;

  if (!grid.enabled) return null;

  return (
    <DreiGrid
      args={[1000, 1000]}
      position={[0, 0.01, 0]}
      cellSize={grid.cellSize}
      cellThickness={grid.cellThickness}
      cellColor={grid.cellColor}
      sectionSize={grid.sectionSize}
      sectionThickness={grid.sectionThickness}
      sectionColor={grid.sectionColor}
      fadeDistance={grid.fadeDistance}
      fadeStrength={grid.fadeStrength}
      fadeFrom={grid.fadeFrom}
      infiniteGrid={grid.infiniteGrid}
      followCamera={grid.followCamera}
    />
  );
}
