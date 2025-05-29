import React, { useEffect, useRef, useState, Suspense } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { TransformControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { Pane } from "tweakpane";

if (!THREE.PositionalAudio.prototype.pause) {
  THREE.PositionalAudio.prototype.pause = function () {
    if (this.isPlaying) {
      this._pausedAt = this.context.currentTime - (this._startedAt || 0);
      this.source.stop(0);
      this.isPlaying = false;
    }
  };
  THREE.PositionalAudio.prototype.resume = function () {
    if (this.buffer && !this.isPlaying && this._pausedAt != null) {
      this.source = this.context.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.loop = this.loop;
      this.source.connect(this.getOutput());
      this._startedAt = this.context.currentTime - this._pausedAt;
      this.source.start(0, this._pausedAt);
      this.isPlaying = true;
      this.source.onended = () => {
        this.isPlaying = false;
      };
    }
  };
}

export default function Broadcaster() {
  const { camera } = useThree();
  const [objectVisible, setObjectVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [showGizmo, setShowGizmo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackName, setTrackName] = useState("");
  const [micEnabled, setMicEnabled] = useState(false);
  const micStreamRef = useRef(null);

  const objectRef = useRef();
  const transformRef = useRef();
  const audioRef = useRef();
  const trackNameBindingRef = useRef(null); // Для обновления названия трека в Tweakpane

  const config = useRef({
    volume: 0.7,
    distance: 10,
    mode: "translate",
    url: "", // Поле для URL
    currentTrack: "", // Для отображения названия трека
  });

  // 📢 Кнопка для открытия панели
  useEffect(() => {
    const btn = document.createElement("button");
    btn.innerText = "📢";
    Object.assign(btn.style, {
      position: "absolute",
      top: "72px",
      right: "20px",
      zIndex: 1001,
      fontSize: "20px",
      background: "#333",
      color: "#fff",
      borderRadius: "50%",
      border: "none",
      cursor: "pointer",
      width: "40px",
      height: "40px",
    });
    btn.onclick = () => {
      if (!objectVisible) {
        setObjectVisible(true);
        setShowGizmo(true); // Показываем гизмо при появлении объекта
      }
      setPanelVisible((prev) => !prev);
    };
    document.body.appendChild(btn);
    return () => btn.remove();
  }, [objectVisible]);

  // 🎛 Панель управления (Tweakpane)
  useEffect(() => {
    if (!panelVisible) return;

    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      position: "absolute",
      top: "120px",
      right: "20px",
      width: "280px",
      zIndex: "1001",
      background: "#181818",
      padding: "8px",
      borderRadius: "8px",
    });
    document.body.appendChild(wrapper);

    const pane = new Pane({ container: wrapper });

    pane.addBinding(config.current, "volume", { min: 0, max: 1, step: 0.01 }).on("change", (e) => {
      audioRef.current?.setVolume(e.value);
    });

    pane.addBinding(config.current, "distance", { min: 1, max: 100, step: 1 }).on("change", (e) => {
      audioRef.current?.setRefDistance(e.value);
    });

    pane.addBinding(config.current, "mode", {
      options: { Translate: "translate", Rotate: "rotate" },
    }).on("change", (e) => {
      transformRef.current?.setMode(e.value.toLowerCase());
    });

    pane.addButton({ title: "Upload Audio File" }).on("click", handleUpload);
    pane.addBinding(config.current, "url", { label: "Audio URL" });

    // Название трека в панели
    trackNameBindingRef.current = pane.addBinding(config.current, "currentTrack", { label: "Track", readonly: true });

    pane.addButton({ title: "▶ Play" }).on("click", playAudio);
    pane.addButton({ title: "⏸ Pause" }).on("click", pauseAudio);
    pane.addButton({ title: "🗑 Delete" }).on("click", deleteObject);

    // Настройка микрофона
    const micInput = document.createElement("input");
    micInput.type = "checkbox";
    micInput.checked = micEnabled;
    micInput.onchange = handleMicToggle;
    const micLabel = document.createElement("label");
    micLabel.style.display = "flex";
    micLabel.style.alignItems = "center";
    micLabel.style.gap = "8px";
    micLabel.appendChild(micInput);
    micLabel.appendChild(document.createTextNode("🎤"));
    wrapper.appendChild(micLabel);

    return () => {
      pane.dispose();
      wrapper.remove();
    };
  }, [panelVisible, micEnabled]);

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      config.current.currentTrack = file.name;
      if (trackNameBindingRef.current) {
        trackNameBindingRef.current.refresh();
      }
      config.current.url = url; // сохраняем url для playAudio
      playNewAudio(url);
    };
    input.click();
  };

  const pauseAudio = () => {
    if (audioRef.current && audioRef.current.isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const playAudio = () => {
    if (audioRef.current && isPaused) {
      audioRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }
    if (config.current.url) {
      const name = config.current.url.split("/").pop();
      config.current.currentTrack = name;
      if (trackNameBindingRef.current) {
        trackNameBindingRef.current.refresh();
      }
      playNewAudio(config.current.url);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      if (audioRef.current.isPlaying) {
        audioRef.current.stop();
      }
      objectRef.current.remove(audioRef.current);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    config.current.currentTrack = ""; // Очищаем название трека
    if (trackNameBindingRef.current) {
      trackNameBindingRef.current.refresh(); // Обновляем отображение в Tweakpane
    }
  };

  const playNewAudio = (url) => {
    stopAudio(); // Очищаем предыдущий трек
    const listener = getOrCreateListener();
    const audio = new THREE.PositionalAudio(listener);
    const loader = new THREE.AudioLoader();
    loader.load(
      url,
      (buffer) => {
        const context = listener.context;
        context.resume().then(() => {
          audio.setBuffer(buffer);
          audio.setRefDistance(config.current.distance);
          audio.setVolume(config.current.volume);
          audio.setLoop(true);
          objectRef.current.add(audio);
          audioRef.current = audio;
          audio.play();
          setIsPlaying(true);
          setIsPaused(false);
        }).catch((err) => {
          console.error("Error resuming audio context:", err);
        });
      },
      undefined,
      (err) => {
        console.error("Error loading audio:", err);
      }
    );
  };

  const getOrCreateListener = () => {
    let listener = camera.children.find((c) => c instanceof THREE.AudioListener);
    if (!listener) {
      listener = new THREE.AudioListener();
      camera.add(listener);
    }
    return listener;
  };

  const deleteObject = () => {
    stopAudio();
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setMicEnabled(false);
    setObjectVisible(false);
    setPanelVisible(false);
    setShowGizmo(false);
  };

  const handleMicToggle = async (e) => {
    const enabled = e.target.checked;
    setMicEnabled(enabled);

    if (enabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const listener = getOrCreateListener();
        const micSource = listener.context.createMediaStreamSource(stream);
        micSource.connect(listener.context.destination);
      } catch (err) {
        alert("Не удалось получить доступ к микрофону");
        setMicEnabled(false);
      }
    } else {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
    }
  };

  // Управление гизмо
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(objectRef.current, true);
      if (intersects.length > 0) {
        setShowGizmo(true); // Показываем гизмо, если кликнули на объект
      } else {
        setShowGizmo(false); // Скрываем гизмо, если кликнули мимо
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [objectRef, camera]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowGizmo(false);
      if (e.key === "Delete") deleteObject();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useFrame(() => {
    if (objectRef.current) {
      objectRef.current.lookAt(camera.position);
    }
  });

  if (!objectVisible) return null;

  return (
    <Suspense fallback={null}>
      {showGizmo ? (
        <TransformControls
          ref={transformRef}
          object={objectRef.current}
          mode={config.current.mode}
        >
          <group ref={objectRef} position={[0, 1.5, 0]}>
            {(isPlaying || micEnabled) && (
              <>
                <Text
                  fontSize={0.4}
                  position={[0, 0.6, 0]}
                  color={"red"}
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
            {config.current.currentTrack && (
              <Text
                fontSize={0.25}
                position={[0, -0.7, 0]}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {config.current.currentTrack}
              </Text>
            )}
          </group>
        </TransformControls>
      ) : (
        <group ref={objectRef} position={[0, 1.5, 0]}>
          {(isPlaying || micEnabled) && (
            <>
              <Text
                fontSize={0.4}
                position={[0, 0.6, 0]}
                color={"red"}
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
          {config.current.currentTrack && (
            <Text
              fontSize={0.25}
              position={[0, -0.7, 0]}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {config.current.currentTrack}
            </Text>
          )}
        </group>
      )}
    </Suspense>
  );
}