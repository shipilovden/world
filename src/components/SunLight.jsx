// src/components/SunLight.jsx
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import store from "../settings/store";

export default function SunLight() {
  const lightRef = useRef();

  useFrame(() => {
    const sky = store.sky;
    const shadow = store.shadow;

    const theta = THREE.MathUtils.degToRad(90 - sky.elevation);
    const phi = THREE.MathUtils.degToRad(sky.azimuth);

    const sun = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(theta),
      Math.cos(phi) * Math.cos(theta)
    );

    if (lightRef.current) {
      lightRef.current.position.copy(sun.clone().multiplyScalar(100));
      lightRef.current.visible = shadow.enabled; // 🔥 главное
      lightRef.current.castShadow = shadow.enabled;
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      castShadow
      visible
      intensity={4.0}
      shadow-mapSize-width={8192}
      shadow-mapSize-height={8192}
      shadow-camera-near={0.5}
      shadow-camera-far={1000}
      shadow-camera-left={-100}
      shadow-camera-right={50}
      shadow-camera-top={50}
      shadow-camera-bottom={-50}
      shadow-bias={-0.0001}
      shadow-radius={2} 
    />
  );
}
