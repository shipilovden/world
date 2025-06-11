// src/Scene.jsx
import React, { useEffect, useRef, useReducer, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import * as THREE from "three";
import Avatar from "./Avatar";
import store from "./settings/store";
import Voxel from "./settings/Voxel";
import Ground from "./components/Ground";
import Grid from "./components/Grid";
import Broadcaster from "./components/Broadcaster";
import SkyComponent from "./components/Sky";
import FogComponent from "./components/Fog";
import SunLight from "./components/SunLight";

export default function Scene({ joystickDir }) {
  const { camera } = useThree();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const avatarRef = useRef();
  const iframeRef = useRef();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    camera.position.set(0, 1.3, 6);
  }, [camera]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (store.grid.__needsUpdate || store.voxels.__needsUpdate || store.broadcaster.__needsUpdate) {
        store.grid.__needsUpdate = false;
        store.voxels.__needsUpdate = false;
        store.broadcaster.__needsUpdate = false;
        forceUpdate();
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") store.voxels.selectedId = null;
    };
    const handleClick = (e) => {
      if (e.target.tagName === "CANVAS") store.voxels.selectedId = null;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handleClick);
    };
  }, []);

  useFrame(() => {
    if (avatarRef.current && !iframeLoaded) {
      const pos = avatarRef.current.position;
      if (pos.distanceTo(new THREE.Vector3(0, pos.y, 20)) < 5) {
        setIframeLoaded(true);
      }
    }

    if (avatarRef.current && iframeLoaded && iframeRef.current) {
      const pos = avatarRef.current.position;
      const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.getWorldQuaternion());
      const offset = dir.multiplyScalar(20);
      iframeRef.current.position.copy(new THREE.Vector3().addVectors(pos, offset).setY(0.1));
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <SunLight />
      <SkyComponent />
      <FogComponent />
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
        <Grid />
        <Avatar ref={avatarRef} castShadow joystickDir={joystickDir} />
        {store.voxels.items.map((voxel) => (
          <Voxel key={voxel.id} voxel={voxel} />
        ))}
        <Broadcaster />
        {iframeLoaded && (
          <Html
            ref={iframeRef}
            position={[0, 0.1, 20]}
            style={{
              width: "400px",
              height: "300px",
              border: "none",
              background: "transparent",
            }}
          >
            <iframe
              src="https://example.com"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
            />
          </Html>
        )}
      </Physics>
    </>
  );
}
