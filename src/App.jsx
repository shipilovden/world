import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import SettingsPanel from "./settings/SettingsPanel";
import MobileJoystick from "./Joystick"; // ✅

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [joystickDir, setJoystickDir] = useState(null);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const handleJoystickMove = (event) => {
    setJoystickDir(event.direction); // например: "FORWARD", "LEFT", "RIGHT", "BACKWARD"
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
          <Canvas
            shadows
            camera={{ position: [0, 1.6, 3], fov: 50, near: 0.1, far: 1000 }}
            gl={{ antialias: true }}
          >
            <Scene joystickDir={joystickDir} />
          </Canvas>

          {isMobile && (
            <MobileJoystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
          )}
        </>
      )}
    </>
  );
}
