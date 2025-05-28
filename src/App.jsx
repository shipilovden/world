import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import SettingsPanel from "./settings/SettingsPanel";
import MobileJoystick from "./Joystick";

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [joystickDir, setJoystickDir] = useState(null);

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const handleJoystickMove = (event) => {
    setJoystickDir(event.direction); // "FORWARD", "LEFT", "RIGHT", "BACKWARD"
  };

  const handleJoystickStop = () => {
    setJoystickDir(null);
  };

  return (
    <>
      {!isStarted && (
        <div className="start-screen">
          <div className="logo-container">
            <img
              src="/logo.png"
              alt="World Logo"
              className="logo-image"
            />
            <h1 className="version-label">World v1.0.0</h1>
          </div>
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
