import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import { Physics, usePlane } from "@react-three/cannon";
import * as THREE from "three";
import Avatar from "./Avatar";
import store from "./settings/store";

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

      // flipX и flipY для отражения текстуры
      const flipX = g.flipX ? -1 : 1;
      const flipY = g.flipY ? -1 : 1;

      // Base map
      if (g.texture) {
        g.texture.wrapS = g.texture.wrapT = THREE.RepeatWrapping;
        g.texture.repeat.set(g.textureScaleX * flipX, g.textureScaleY * flipY);
        g.texture.offset.set(g.uvOffsetX ?? 0, g.uvOffsetY ?? 0);
        mat.map = g.texture;
      } else {
        mat.map = null;
      }

      // Normal map
      if (g.normalMap) {
        g.normalMap.wrapS = g.normalMap.wrapT = THREE.RepeatWrapping;
        g.normalMap.repeat.set(g.textureScaleX * flipX, g.textureScaleY * flipY);
        g.normalMap.offset.set(g.uvOffsetX ?? 0, g.uvOffsetY ?? 0);
        mat.normalMap = g.normalMap;
      } else {
        mat.normalMap = null;
      }

      // Roughness map
      if (g.roughnessMap) {
        g.roughnessMap.wrapS = g.roughnessMap.wrapT = THREE.RepeatWrapping;
        g.roughnessMap.repeat.set(g.textureScaleX * flipX, g.textureScaleY * flipY);
        g.roughnessMap.offset.set(g.uvOffsetX ?? 0, g.uvOffsetY ?? 0);
        mat.roughnessMap = g.roughnessMap;
      } else {
        mat.roughnessMap = null;
      }

      // AO map
      if (g.aoMap) {
        g.aoMap.wrapS = g.aoMap.wrapT = THREE.RepeatWrapping;
        g.aoMap.repeat.set(g.textureScaleX * flipX, g.textureScaleY * flipY);
        g.aoMap.offset.set(g.uvOffsetX ?? 0, g.uvOffsetY ?? 0);
        mat.aoMap = g.aoMap;
      } else {
        mat.aoMap = null;
      }

      // Metalness map
      if (g.metalnessMap) {
        g.metalnessMap.wrapS = g.metalnessMap.wrapT = THREE.RepeatWrapping;
        g.metalnessMap.repeat.set(g.textureScaleX * flipX, g.textureScaleY * flipY);
        g.metalnessMap.offset.set(g.uvOffsetX ?? 0, g.uvOffsetY ?? 0);
        mat.metalnessMap = g.metalnessMap;
      } else {
        mat.metalnessMap = null;
      }

      // Height map (displacement)
      if (g.heightMap) {
        g.heightMap.wrapS = g.heightMap.wrapT = THREE.RepeatWrapping;
        g.heightMap.repeat.set(g.textureScaleX * flipX, g.textureScaleY * flipY);
        g.heightMap.offset.set(g.uvOffsetX ?? 0, g.uvOffsetY ?? 0);
        mat.displacementMap = g.heightMap;
        mat.displacementScale = g.displacementScale ?? 0.1;
      } else {
        mat.displacementMap = null;
      }

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
export default function Scene() {
  const { camera, scene } = useThree();

  const smallGrid = useRef();
  const mediumGrid = useRef();
  const largeGrid = useRef();

  useEffect(() => {
    camera.position.set(0, 1.3, 6);
    scene.fog = new THREE.Fog("#f0f0f0", 30, 100);
  }, [camera, scene]);

  useEffect(() => {
    const update = () => {
      const g = store.grid;

      if (smallGrid.current?.material) {
        smallGrid.current.visible = g.showSmall;
        smallGrid.current.material.opacity = g.opacitySmall;
        smallGrid.current.material.color.set(g.colorSmall);
        smallGrid.current.material.transparent = true;
        smallGrid.current.material.depthWrite = false;
        smallGrid.current.material.fog = true;
        smallGrid.current.material.needsUpdate = true;
      }

      if (mediumGrid.current?.material) {
        mediumGrid.current.visible = g.showMedium;
        mediumGrid.current.material.opacity = g.opacityMedium;
        mediumGrid.current.material.color.set(g.colorMedium);
        mediumGrid.current.material.transparent = true;
        mediumGrid.current.material.depthWrite = false;
        mediumGrid.current.material.fog = true;
        mediumGrid.current.material.needsUpdate = true;
      }

      if (largeGrid.current?.material) {
        largeGrid.current.visible = g.showLarge;
        largeGrid.current.material.opacity = g.opacityLarge;
        largeGrid.current.material.color.set(g.colorLarge);
        largeGrid.current.material.transparent = true;
        largeGrid.current.material.depthWrite = false;
        largeGrid.current.material.fog = true;
        largeGrid.current.material.needsUpdate = true;
      }
    };

    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        position={[5, 10, 5]}
        intensity={4.0}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
        shadow-radius={0.5}
      />
      <Sky
        distance={450}
        sunPosition={[5, 10, 5]}
        turbidity={2}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        inclination={0.6}
        azimuth={0.25}
      />
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
        <Avatar />
      </Physics>
    </>
  );
}