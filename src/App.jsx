import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import SettingsPanel from "./settings/SettingsPanel";
import MobileJoystick from "./Joystick";
import Chat, { ChatProvider } from "./Chat";
import Broadcaster from "./settings/Broadcaster"; // ✅ Добавлен импорт Broadcaster
import DownloadAvatar from "./settings/DownloadAvatar";
import EmotionSelector from "./settings/EmotionSelector";

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [joystickDir, setJoystickDir] = useState(null);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const handleJoystickMove = (event) => {
    setJoystickDir(event.direction);
  };

  const handleJoystickStop = () => {
    setJoystickDir(null);
  };

  return (
    <>
      {!isStarted && (
        <div className="start-screen">
          <button className="start-button" onClick={() => setIsStarted(true)}>
            Start
          </button>
        </div>
      )}

      {isStarted && (
        <>
          <SettingsPanel />
          <ChatProvider>
            <Chat />
          </ChatProvider>

          <Canvas
            shadows
            camera={{ position: [0, 1.6, 3], fov: 50, near: 0.1, far: 1000 }}
            gl={{ antialias: true }}
          >
            <Scene joystickDir={joystickDir} />
            <Broadcaster /> {/* ✅ Добавлен сам компонент */}
          </Canvas>

          {isMobile && (
            <MobileJoystick
              onMove={handleJoystickMove}
              onStop={handleJoystickStop}
            />
          )}
        </>
      )}
    </>
  );
}
