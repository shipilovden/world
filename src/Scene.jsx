// src/Scene.jsx
import React, { useEffect, useRef, useReducer } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import { Physics, usePlane } from "@react-three/cannon";
import * as THREE from "three";
import Avatar from "./Avatar";
import store from "./settings/store";
import Voxel from "./settings/Voxel";

// ====== КОМПОНЕНТ ПОЛА (GROUND) ======
function Ground() {
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
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 1000, 256, 256]} />
      <meshStandardMaterial ref={materialRef} />
    </mesh>
  );
}

// ====== ОСНОВНАЯ СЦЕНА ======
export default function Scene({ joystickDir }) {
  const { camera, scene, gl } = useThree();

  const [, forceUpdate] = useReducer((x) => x + 1, 0); // 🟢 ререндер по флагу
  const smallGrid = useRef();
  const mediumGrid = useRef();
  const largeGrid = useRef();
  const skyRef = useRef();
  const sunLightRef = useRef();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);

  useEffect(() => {
    camera.position.set(0, 1.3, 6);
  }, [camera]);

  useEffect(() => {
    const interval = setInterval(() => {
      const sky = store.sky;
      const fog = store.fog;

      if (fog.fogEnabled) {
        scene.fog =
          fog.fogMode === "exp" || fog.fogMode === "exp2"
            ? new THREE.FogExp2(fog.fogColor, fog.fogDensity)
            : new THREE.Fog(fog.fogColor, fog.fogNear, fog.fogFar);
      } else {
        scene.fog = null;
      }

      scene.background = new THREE.Color(sky.backgroundColor ?? "#000000");

      if (sky.environmentMap) {
        scene.environment = sky.environmentMap;
      }

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

      if (sunLightRef.current) {
        sunLightRef.current.position.copy(sun.clone().multiplyScalar(100));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [scene, gl]);

  useEffect(() => {
    const update = () => {
      const g = store.grid;

      const updateGrid = (ref, visible, opacity, color) => {
        if (ref.current?.material) {
          ref.current.visible = visible;
          ref.current.material.opacity = opacity;
          ref.current.material.color.set(color);
          ref.current.material.transparent = true;
          ref.current.material.depthWrite = false;
          ref.current.material.fog = true;
          ref.current.material.needsUpdate = true;
        }
      };

      updateGrid(smallGrid, g.showSmall, g.opacitySmall, g.colorSmall);
      updateGrid(mediumGrid, g.showMedium, g.opacityMedium, g.colorMedium);
      updateGrid(largeGrid, g.showLarge, g.opacityLarge, g.colorLarge);
    };

    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, []);

  // 🧼 Снятие выделения по Esc и клику вне объектов
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        store.voxels.selectedId = null;
      }
    };

    const handleClick = (e) => {
      if (e.target.tagName === "CANVAS") {
        store.voxels.selectedId = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handleClick);
    };
  }, []);

  // 🟢 Форс ререндер при флаге
  useEffect(() => {
    const interval = setInterval(() => {
      if (store.voxels.__needsUpdate) {
        store.voxels.__needsUpdate = false;
        forceUpdate();
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        ref={sunLightRef}
        castShadow
        intensity={4.0}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.001}
        shadow-radius={1}
      />
      <Sky ref={skyRef} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        dampingFactor={0.05}
        enableDamping={true}
        rotateSpeed={0.5}
      />
      <Physics gravity={[0, -9.81, 0]}>
        <Ground />
        <gridHelper ref={smallGrid} args={[1000, 1000]} position={[0, 0.01, 0]} />
        <gridHelper ref={mediumGrid} args={[1000, 100]} position={[0, 0.02, 0]} />
        <gridHelper ref={largeGrid} args={[1000, 50]} position={[0, 0.03, 0]} />
        <Avatar castShadow joystickDir={joystickDir} />
        {store.voxels.items.map((voxel) => (
          <Voxel key={voxel.id} voxel={voxel} />
        ))}
      </Physics>
    </>
  );
}
