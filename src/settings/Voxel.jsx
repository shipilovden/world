// src/settings/Voxel.jsx
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import store from "./store";

export default function Voxel({ voxel }) {
  const meshRef = useRef();
  const controlsRef = useRef();
  const { camera, gl, scene } = useThree();
  const isSelected = voxel.id === store.voxels.selectedId;

  // Выделение по клику
  const handleClick = (e) => {
    e.stopPropagation();
    store.voxels.selectedId = voxel.id;
    store.voxels.__needsUpdate = true;
  };

  // Обновление позиции
  useEffect(() => {
    if (!controlsRef.current) return;

    const callback = () => {
      const pos = meshRef.current.position;
      store.updateVoxel(voxel.id, {
        position: { x: pos.x, y: pos.y, z: pos.z },
      });
    };

    controlsRef.current.addEventListener("objectChange", callback);
    return () => {
      controlsRef.current?.removeEventListener("objectChange", callback);
    };
  }, [voxel.id]);

  // Снятие выделения по Esc или клику вне объекта
  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === "Escape") {
        store.deselectVoxel();
      } else if (e.key === "Delete" && isSelected) {
        store.removeVoxel(voxel.id);
      }
    };
    const clickAway = (e) => {
      if (e.target.tagName === "CANVAS") {
        store.deselectVoxel();
      }
    };

    window.addEventListener("keydown", escHandler);
    window.addEventListener("pointerdown", clickAway);
    return () => {
      window.removeEventListener("keydown", escHandler);
      window.removeEventListener("pointerdown", clickAway);
    };
  }, [voxel.id, isSelected]);

  return (
    <>
      <mesh
        ref={meshRef}
        position={[
          voxel.position.x,
          voxel.position.y,
          voxel.position.z,
        ]}
        scale={[voxel.scale.x, voxel.scale.y, voxel.scale.z]}
        onClick={handleClick}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={voxel.color} />
      </mesh>

      {isSelected && (
        <TransformControls
          ref={controlsRef}
          object={meshRef.current}
          mode="translate"
          camera={camera}
          domElement={gl.domElement}
        />
      )}
    </>
  );
}
