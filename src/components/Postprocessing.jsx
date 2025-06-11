import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import store from "../settings/store";

export default function Postprocessing() {
  const { gl } = useThree();
  const composerRef = useRef();
  const [key, setKey] = useState(0);
  const shadow = store.shadow;

  useEffect(() => {
    gl.autoClear = false;
  }, [gl]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (shadow.__needsUpdate) {
        shadow.__needsUpdate = false;
        setKey((k) => k + 1);
        composerRef.current?.setSize(gl.domElement.width, gl.domElement.height);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!shadow.enabled) return null;

  return (
    <EffectComposer key={key} ref={composerRef} autoClear={false}>
      <ContactShadows
        key={`contact-${key}`}
        position={[0, 0.01, 0]}
        scale={100}
        resolution={2048}
        far={shadow.distance}
        blur={shadow.blur}
        opacity={shadow.opacity}
        color={shadow.color}
        frames={1}
      />
    </EffectComposer>
  );
}
