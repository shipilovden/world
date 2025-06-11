import React, { useEffect, useRef } from "react";
import { usePlane } from "@react-three/cannon";
import * as THREE from "three";
import store from "../settings/store";

export default function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));

  const materialRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      const g = store.ground;
      const mat = materialRef.current;
      if (!mat) return;

      mat.color.set(g.color);
      mat.opacity = g.opacity;
      mat.roughness = g.roughness;
      mat.metalness = g.metalness ?? 0;
      mat.aoMapIntensity = g.aoMapIntensity ?? 1;
      mat.normalScale = new THREE.Vector2(g.normalScale ?? 1, g.normalScale ?? 1);
      mat.displacementScale = g.displacementScale ?? 0.1;
      mat.transparent = g.opacity < 1;

      const flipX = g.flipX ? -1 : 1;
      const flipY = g.flipY ? -1 : 1;

      const applyTexture = (mapKey, targetProp) => {
        const tex = g[mapKey];
        if (tex) {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(g.textureScaleX * flipX, g.textureScaleY * flipY);
          tex.offset.set(g.uvOffsetX ?? 0, g.uvOffsetY ?? 0);
          mat[targetProp] = tex;
        } else {
          mat[targetProp] = null;
        }
      };

      applyTexture("texture", "map");
      applyTexture("normalMap", "normalMap");
      applyTexture("roughnessMap", "roughnessMap");
      applyTexture("aoMap", "aoMap");
      applyTexture("metalnessMap", "metalnessMap");
      applyTexture("heightMap", "displacementMap");

      mat.needsUpdate = true;
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <mesh
      ref={ref}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]} // ✅ гарантирует правильную ориентацию для тени
      position={[0, 0, 0]}            // ✅ чтобы не было offset у receiveShadow
    >
      <planeGeometry args={[1000, 1000, 256, 256]} />
      <meshStandardMaterial ref={materialRef} />
    </mesh>
  );
}
