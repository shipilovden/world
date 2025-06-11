import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { CharacterControls } from './CharacterControls';
import { DIRECTIONS } from './utils/keys';
import * as THREE from 'three';

export default React.forwardRef(function Avatar({ joystickDir }, ref) {
  const group = useRef();
  const [keysPressed, setKeysPressed] = useState({});
  const [isRunMode, setIsRunMode] = useState(false);
  const [cameraFollowMode, setCameraFollowMode] = useState(false);
  const { camera } = useThree();
  const orbitControlsRef = useRef();
  const characterControlsRef = useRef();

  const { scene, animations } = useGLTF('/models/Soldier.glb');
  const { actions, names, mixer } = useAnimations(animations, group);

  const [refMesh, api] = useBox(() => ({
    mass: 1,
    position: [0, 1, 0],
    args: [1, 2, 1],
  }));

  useImperativeHandle(ref, () => ({
    position: refMesh.current.position,
  }));

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === 'shift' && !keysPressed['shift']) {
        setIsRunMode(prev => !prev);
        if (characterControlsRef.current) {
          characterControlsRef.current.switchRunToggle();
        }
      }

      if (key === 'r') {
        setCameraFollowMode(prev => !prev);
      }

      setKeysPressed(prev => ({ ...prev, [key]: true }));
    };

    const handleKeyUp = (e) => {
      setKeysPressed(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    if (names.length > 0) {
      console.log('🎮 Доступные анимации:', names);
      console.log('🧩 Анимации-объекты:', actions);

      const animationsMap = new Map();
      if (names.includes('Idle')) animationsMap.set('Idle', actions['Idle']);
      if (names.includes('Walk')) animationsMap.set('Walk', actions['Walk']);
      if (names.includes('Run')) animationsMap.set('Run', actions['Run']);
      if (animationsMap.size === 0 && names.length > 0) {
        animationsMap.set('Idle', actions[names[0]]);
      }

      if (mixer && animationsMap.size > 0) {
        characterControlsRef.current = new CharacterControls(
          scene,
          mixer,
          animationsMap,
          orbitControlsRef.current,
          camera,
          'Idle'
        );
      }
    }
  }, [scene, actions, names, mixer, camera]);

  useFrame((state, delta) => {
    if (characterControlsRef.current) {
      characterControlsRef.current.update(delta, keysPressed);
    }

    if (cameraFollowMode && refMesh.current && characterControlsRef.current) {
      const pos = refMesh.current.position;
      const dir = characterControlsRef.current.walkDirection || new THREE.Vector3(0, 0, 1);

      const distance = 5;
      const height = 2;

      const cameraPosition = {
        x: pos.x - dir.x * distance,
        y: pos.y + height,
        z: pos.z - dir.z * distance
      };

      camera.position.lerp(new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z), 0.05);

      const targetPosition = {
        x: pos.x,
        y: pos.y + 1,
        z: pos.z
      };

      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.set(
          targetPosition.x,
          targetPosition.y,
          targetPosition.z
        );
      }

      camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
    }
  });

  useEffect(() => {
    if (!joystickDir) {
      setKeysPressed(prev => ({ ...prev, w: false, a: false, s: false, d: false }));
      return;
    }
    const dirMap = {
      FORWARD: { w: true },
      BACKWARD: { s: true },
      LEFT: { a: true },
      RIGHT: { d: true },
    };
    setKeysPressed(prev => ({
      w: !!dirMap[joystickDir]?.w,
      a: !!dirMap[joystickDir]?.a,
      s: !!dirMap[joystickDir]?.s,
      d: !!dirMap[joystickDir]?.d,
      shift: prev.shift,
    }));
  }, [joystickDir]);

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
      <group ref={refMesh}>
        <group ref={group} position={[0, -1, 0]}>
          <primitive object={scene} scale={1} />
        </group>
      </group>
    </>
  );
});
