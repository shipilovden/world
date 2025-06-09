import React, { useEffect, useRef, useReducer, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, TransformControls, Text } from "@react-three/drei";
import { Physics, usePlane } from "@react-three/cannon";
import * as THREE from "three";
import Avatar from "./Avatar";
import store from "./settings/store";
import Voxel from "./settings/Voxel";
import { Grid } from "@react-three/drei";

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

// ====== 📢 БРОДКАСТЕР ======
function Broadcaster() {
  const ref = useRef();
  const transformRef = useRef();
  const audioRef = useRef();
  const micStreamRef = useRef(null);
  const { camera } = useThree();
  const [visible, setVisible] = useState(false);
  const [trackName, setTrackName] = useState("");
  const broadcaster = store.broadcaster;

  useEffect(() => {
    if (broadcaster.remove) {
      setVisible(false);
      broadcaster.remove = false;

      if (audioRef.current?.isPlaying) {
        audioRef.current.stop();
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
    }

    if (broadcaster.active) {
      setVisible(true);
      broadcaster.active = false;
    }
  }, [broadcaster.active, broadcaster.remove]);

  useEffect(() => {
    if (!visible) return;

    if (broadcaster.play && broadcaster.url) {
      const listener = getOrCreateListener();
      const audio = new THREE.PositionalAudio(listener);

      if (audioRef.current?.isPlaying) {
        audioRef.current.stop();
      }
      
      new THREE.AudioLoader().load(
        broadcaster.url, 
        (buffer) => {
          audio.setBuffer(buffer);
          audio.setRefDistance(broadcaster.distance);
          audio.setVolume(broadcaster.volume);
          audio.setLoop(true);
          audio.play();
          
          if (ref.current) {
            ref.current.add(audio);
          }
          audioRef.current = audio;
          broadcaster.play = false;
        },
        undefined,
        (error) => {
          console.error('Ошибка загрузки аудио:', error);
          broadcaster.play = false;
        }
      );
    }

    if (broadcaster.pause && audioRef.current?.isPlaying) {
      audioRef.current.pause();
      broadcaster.pause = false;
    }

    if (broadcaster.micEnabled && !micStreamRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const listener = getOrCreateListener();
          const audioContext = listener.context;
          
          const micSource = audioContext.createMediaStreamSource(stream);
          const gainNode = audioContext.createGain();
          gainNode.gain.value = broadcaster.volume;
          
          micSource.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          micStreamRef.current = stream;
          console.log('Микрофон подключен');
        })
        .catch((error) => {
          console.error('Ошибка доступа к микрофону:', error);
          broadcaster.micEnabled = false;
        });
    }

    if (!broadcaster.micEnabled && micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      console.log('Микрофон отключен');
    }

    if (broadcaster.triggerUpload) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.style.display = "none";
      
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (broadcaster.url && broadcaster.url.startsWith('blob:')) {
          URL.revokeObjectURL(broadcaster.url);
        }
        
        const url = URL.createObjectURL(file);
        broadcaster.url = url;
        broadcaster.currentTrack = file.name;
        setTrackName(file.name);
        broadcaster.play = true;
        
        console.log('Файл загружен:', file.name);
      };
      
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
      
      broadcaster.triggerUpload = false;
    }
  }, [
    visible,
    broadcaster.play,
    broadcaster.pause,
    broadcaster.micEnabled,
    broadcaster.triggerUpload,
    broadcaster.url,
    broadcaster.volume,
    broadcaster.distance
  ]);

  useFrame(() => {
    if (ref.current) {
      ref.current.lookAt(camera.position);
    }
    
    if (transformRef.current) {
      transformRef.current.setMode(broadcaster.mode);
    }
    
    if (audioRef.current) {
      audioRef.current.setVolume(broadcaster.volume);
      audioRef.current.setRefDistance(broadcaster.distance);
    }
  });

  const getOrCreateListener = () => {
    let listener = camera.children.find((c) => c instanceof THREE.AudioListener);
    if (!listener) {
      listener = new THREE.AudioListener();
      camera.add(listener);
    }
    return listener;
  };

  if (!visible) return null;

  return (
    <TransformControls ref={transformRef} object={ref.current}>
      <group ref={ref} position={[0, 1.5, 0]}>
        {(broadcaster.micEnabled || audioRef.current?.isPlaying) && (
          <>
            <Text 
              fontSize={0.4} 
              position={[0, 0.6, 0]} 
              color="red" 
              anchorX="center" 
              anchorY="middle"
            >
              ON AIR
            </Text>
            <mesh>
              <ringGeometry args={[0.6, 0.7, 32]} />
              <meshBasicMaterial color="red" transparent opacity={0.5} />
            </mesh>
          </>
        )}

        <Text fontSize={1} anchorX="center" anchorY="middle">
          📢
        </Text>
        {trackName && (
          <Text 
            fontSize={0.25} 
            position={[0, -0.7, 0]} 
            color="white" 
            anchorX="center" 
            anchorY="middle"
          >
            {trackName}
          </Text>
        )}
      </group>
    </TransformControls>
  );
}

// ====== ОСНОВНАЯ СЦЕНА ======
export default function Scene({ joystickDir }) {
  const { camera, scene, gl } = useThree();

  const [, forceUpdate] = useReducer((x) => x + 1, 0);
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
    let lastSkyState = {};
    let lastFogState = {};
    const interval = setInterval(() => {
      const sky = store.sky;
      const fog = store.fog;
      const currentFogState = { ...fog };
      const currentSkyState = { ...sky };

      const fogChanged = JSON.stringify(currentFogState) !== JSON.stringify(lastFogState);
      if (fogChanged) {
        if (fog.fogEnabled) {
          scene.fog = fog.fogMode === "exp" || fog.fogMode === "exp2"
            ? new THREE.FogExp2(fog.fogColor, fog.fogDensity)
            : new THREE.Fog(fog.fogColor, fog.fogNear, fog.fogFar);
        } else {
          scene.fog = null;
        }
        lastFogState = currentFogState;
      }

      const skyChanged = JSON.stringify(currentSkyState) !== JSON.stringify(lastSkyState);
      if (skyChanged) {
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
        if (sunLightRef.current) {
          sunLightRef.current.position.copy(sun.clone().multiplyScalar(100));
        }
        lastSkyState = currentSkyState;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [scene, gl]);

  useEffect(() => {
    let lastGridState = {};

    const interval = setInterval(() => {
      const g = store.grid;
      const state = JSON.stringify(g);

      if (state !== lastGridState) {
        lastGridState = state;
        forceUpdate();
      }

      if (g.__needsUpdate) {
        g.__needsUpdate = false;
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (store.voxels.__needsUpdate) {
        store.voxels.__needsUpdate = false;
        forceUpdate();
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (store.broadcaster.__needsUpdate) {
        store.broadcaster.__needsUpdate = false;
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
        {store.grid.enabled && (
          <Grid
            args={[1000, 1000]}
            position={[0, 0.01, 0]}
            cellSize={store.grid.cellSize}
            cellThickness={store.grid.cellThickness}
            cellColor={store.grid.cellColor}
            sectionSize={store.grid.sectionSize}
            sectionThickness={store.grid.sectionThickness}
            sectionColor={store.grid.sectionColor}
            fadeDistance={store.grid.fadeDistance}
            fadeStrength={store.grid.fadeStrength}
            fadeFrom={store.grid.fadeFrom}
            infiniteGrid={store.grid.infiniteGrid}
            followCamera={store.grid.followCamera}
          />
        )}
        <Avatar castShadow joystickDir={joystickDir} />
        {store.voxels.items.map((voxel) => (
          <Voxel key={voxel.id} voxel={voxel} />
        ))}
        <Broadcaster />
      </Physics>
    </>
  );
}