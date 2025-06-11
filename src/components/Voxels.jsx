import React from "react";
import store from "../settings/store";
import Voxel from "../settings/Voxel";

export default function Voxels() {
  return (
    <>
      {store.voxels.items.map((voxel) => (
        <Voxel key={voxel.id} voxel={voxel} />
      ))}
    </>
  );
}
