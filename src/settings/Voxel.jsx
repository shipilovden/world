import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import * as THREE from "three";
import store from "./store";

export default function Voxel({ voxel }) {
  const meshRef = useRef();
  const controlsRef = useRef();
  const { camera, gl, controls } = useThree();
  const isSelected = voxel.id === store.voxels.selectedId;

  useEffect(() => {
    const mesh = meshRef.current;
    const ctrl = controlsRef.current;
    if (!mesh || !ctrl) return;

    const update = () => {
      store.updateVoxel(voxel.id, {
        position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
        rotation: {
          x: THREE.MathUtils.radToDeg(mesh.rotation.x),
          y: THREE.MathUtils.radToDeg(mesh.rotation.y),
          z: THREE.MathUtils.radToDeg(mesh.rotation.z),
        },
        scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
      });
    };

    ctrl.addEventListener("objectChange", update);
    ctrl.addEventListener("dragging-changed", (e) => {
      if (controls) controls.enabled = !e.value;
    });

    return () => {
      ctrl.removeEventListener("objectChange", update);
    };
  }, [voxel.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") store.deselectVoxel();
      if (e.key === "Delete" && isSelected) store.removeVoxel(voxel.id);
    };
    const onClick = (e) => {
      if (e.target.tagName === "CANVAS") store.deselectVoxel();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [isSelected, voxel.id]);

  return (
    <>
      <mesh
        ref={meshRef}
        position={[voxel.position.x, voxel.position.y, voxel.position.z]}
        rotation={[
          THREE.MathUtils.degToRad(voxel.rotation.x),
          THREE.MathUtils.degToRad(voxel.rotation.y),
          THREE.MathUtils.degToRad(voxel.rotation.z),
        ]}
        scale={[voxel.scale.x, voxel.scale.y, voxel.scale.z]}
        onClick={(e) => {
          e.stopPropagation();
          store.voxels.selectedId = voxel.id;
          store.voxels.__needsUpdate = true;
        }}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={voxel.color} map={voxel.texture || null} />
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
