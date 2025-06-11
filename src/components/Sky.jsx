// src/components/Sky.jsx
import { useEffect, useRef } from "react";
import { Sky as DreiSky } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import store from "../settings/store";

export default function Sky() {
  const skyRef = useRef();
  const { scene, gl } = useThree();

  useEffect(() => {
    const interval = setInterval(() => {
      const sky = store.sky;

      if (sky.__needsUpdate) {
        sky.__needsUpdate = false;

        scene.background = new THREE.Color(sky.backgroundColor ?? "#000000");
        if (sky.environmentMap) scene.environment = sky.environmentMap;
        gl.toneMappingExposure = sky.exposure ?? 0.5;

        const theta = THREE.MathUtils.degToRad(90 - sky.elevation);
        const phi = THREE.MathUtils.degToRad(sky.azimuth);
        const sun = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(theta),
          Math.cos(phi) * Math.cos(theta)
        );

        if (skyRef.current?.material?.uniforms) {
          skyRef.current.material.uniforms["turbidity"].value = sky.turbidity;
          skyRef.current.material.uniforms["rayleigh"].value = sky.rayleigh;
          skyRef.current.material.uniforms["mieCoefficient"].value = sky.mieCoefficient;
          skyRef.current.material.uniforms["mieDirectionalG"].value = sky.mieDirectionalG;
          skyRef.current.material.uniforms["sunPosition"].value.copy(sun);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [scene, gl]);

  return <DreiSky ref={skyRef} />;
}
