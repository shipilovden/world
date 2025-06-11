// src/components/Fog.jsx
import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import store from "../settings/store";

export default function Fog() {
  const { scene } = useThree();

  useEffect(() => {
    let lastState = "";

    const interval = setInterval(() => {
      const fog = store.fog;
      const currentState = JSON.stringify(fog);

      if (currentState !== lastState || fog.__needsUpdate) {
        lastState = currentState;
        fog.__needsUpdate = false;

        if (fog.fogEnabled) {
          scene.fog =
            fog.fogMode === "exp" || fog.fogMode === "exp2"
              ? new THREE.FogExp2(fog.fogColor, fog.fogDensity)
              : new THREE.Fog(fog.fogColor, fog.fogNear, fog.fogFar);
        } else {
          scene.fog = null;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [scene]);

  return null;
}
