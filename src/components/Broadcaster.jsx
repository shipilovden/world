import React, { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { TransformControls, Text } from "@react-three/drei";
import * as THREE from "three";
import store from "../settings/store";

export default function Broadcaster() {
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
      audioRef.current?.stop();
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
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
      audioRef.current?.stop();

      new THREE.AudioLoader().load(
        broadcaster.url,
        (buffer) => {
          audio.setBuffer(buffer);
          audio.setRefDistance(broadcaster.distance);
          audio.setVolume(broadcaster.volume);
          audio.setLoop(true);
          audio.play();
          ref.current?.add(audio);
          audioRef.current = audio;
        }
      );
      broadcaster.play = false;
    }

    if (broadcaster.pause && audioRef.current?.isPlaying) {
      audioRef.current.pause();
      broadcaster.pause = false;
    }

    if (broadcaster.micEnabled && !micStreamRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const listener = getOrCreateListener();
        const source = listener.context.createMediaStreamSource(stream);
        const gainNode = listener.context.createGain();
        gainNode.gain.value = broadcaster.volume;
        source.connect(gainNode).connect(listener.context.destination);
        micStreamRef.current = stream;
      });
    }

    if (!broadcaster.micEnabled && micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    if (broadcaster.triggerUpload) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (broadcaster.url?.startsWith("blob:")) URL.revokeObjectURL(broadcaster.url);
        broadcaster.url = URL.createObjectURL(file);
        broadcaster.currentTrack = file.name;
        setTrackName(file.name);
        broadcaster.play = true;
      };
      input.click();
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
    if (ref.current) ref.current.lookAt(camera.position);
    if (transformRef.current) transformRef.current.setMode(broadcaster.mode);
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
            <Text fontSize={0.4} position={[0, 0.6, 0]} color="red" anchorX="center" anchorY="middle">
              ON AIR
            </Text>
            <mesh>
              <ringGeometry args={[0.6, 0.7, 32]} />
              <meshBasicMaterial color="red" transparent opacity={0.5} />
            </mesh>
          </>
        )}
        <Text fontSize={1} anchorX="center" anchorY="middle">📢</Text>
        {trackName && (
          <Text fontSize={0.25} position={[0, -0.7, 0]} color="white" anchorX="center" anchorY="middle">
            {trackName}
          </Text>
        )}
      </group>
    </TransformControls>
  );
}
