import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import SettingsPanel from "./settings/SettingsPanel"; // 👈 Подключаем шестерёнку

export default function App() {
  const [isStarted, setIsStarted] = useState(false);

  return (
    <>
      {/* Стартовая заставка */}
      {!isStarted && (
        <div className="start-screen">
          <button className="start-button" onClick={() => setIsStarted(true)}>
            Start
          </button>
        </div>
      )}

      {/* Основной Canvas + панель шестерёнки */}
      {isStarted && (
        <>
          <SettingsPanel /> {/* 👈 Показываем только после старта */}
          <Canvas
            shadows
            camera={{ position: [0, 1.6, 3], fov: 50, near: 0.1, far: 1000 }}
            gl={{ antialias: true }}
          >
            <Scene />
          </Canvas>
        </>
      )}
    </>
  );
}
