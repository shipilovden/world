import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import store from "../settings/store";

export default function Shadow() {
  const lightRef = useRef();
  const targetRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;

    const update = () => {
      const { elevation, azimuth } = store.sky;
      const { enabled } = store.shadow;

      const phi = THREE.MathUtils.degToRad(90 - elevation);
      const theta = THREE.MathUtils.degToRad(azimuth);
      const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta).multiplyScalar(30);

      light.position.copy(sunPosition);
      light.target.position.set(0, 0, 0);
      light.target.updateMatrixWorld();

      light.intensity = enabled ? 0.8 : 0;
      light.visible = true; // всегда видим, intensity = 0 выключает свет
      light.castShadow = enabled;

      light.shadow.mapSize.set(2048, 2048);
      light.shadow.bias = -0.0005;
      light.shadow.normalBias = 0.02;
      light.shadow.radius = 2;

      const cam = light.shadow.camera;
      const size = 30;
      cam.left = -size;
      cam.right = size;
      cam.top = size;
      cam.bottom = -size;
      cam.near = 0.1;
      cam.far = 100;
      cam.updateProjectionMatrix();
    };

    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <directionalLight
        ref={lightRef}
        castShadow
        target={targetRef.current}
      />
      <object3D ref={targetRef} position={[0, 0, 0]} />
    </>
  );
}
