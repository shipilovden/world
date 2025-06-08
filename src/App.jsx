import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import SettingsPanel from "./settings/SettingsPanel";
import MobileJoystick from "./Joystick";
import Chat, { ChatProvider } from "./Chat";
import Broadcaster from "./settings/Broadcaster";
import * as Tweakpane from "tweakpane";
import { splashSettings } from "./shaders/SplashShader";

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [joystickDir, setJoystickDir] = useState(null);
  const startPaneRef = useRef(null);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const handleJoystickMove = (event) => {
    setJoystickDir(event.direction);
  };

  const handleJoystickStop = () => {
    setJoystickDir(null);
  };

  useEffect(() => {
    if (!isStarted) {
      splashSettings();
    }
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted && !startPaneRef.current) {
      const pane = new Tweakpane.Pane({
        title: "🚀 Start World",
        container: document.querySelector("#start-pane"),
        expanded: false,
      });

      pane.addButton({ title: "Start" }).on("click", () => {
        setIsStarted(true);
        pane.dispose();
        const splash = document.getElementById("splash-container");
        if (splash) splash.innerHTML = "";
      });

      const f = pane.addFolder({ title: "⭐ Splash Settings" });
      f.addBinding(window.SPLASH_PARAMS, "opacity", { min: 0, max: 1, step: 0.01 });
      f.addBinding(window.SPLASH_PARAMS, "color1", { view: "color" });
      f.addBinding(window.SPLASH_PARAMS, "color2", { view: "color" });
      f.addBinding(window.SPLASH_PARAMS, "color3", { view: "color" });
      f.addBinding(window.SPLASH_PARAMS, "bloomStrength", { min: 0, max: 5, step: 0.01 });
      f.addBinding(window.SPLASH_PARAMS, "bloomRadius", { min: 0, max: 5, step: 0.01 });
      f.addBinding(window.SPLASH_PARAMS, "bloomThreshold", { min: 0, max: 1, step: 0.01 });

      const creator = pane.addFolder({ title: "🧠 Creator" });
      creator.addButton({ title: "👤 Denis Shipilov" }).on("click", () => {});
      creator.addButton({ title: "🌐 Website" }).on("click", () => {});
      creator.addButton({ title: "📘 VK" }).on("click", () => {});
      creator.addButton({ title: "🐦 Twitter" }).on("click", () => {});

      const projects = creator.addFolder({ title: "🧱 Projects by Denis Shipilov" });
      projects.addButton({ title: "🎬 Film Project" }).on("click", () => {});
      projects.addButton({ title: "🎮 Game Prototype" }).on("click", () => {});
      projects.addButton({ title: "🎧 Music Vibes" }).on("click", () => {});

      startPaneRef.current = pane;
    }
  }, [isStarted]);

  return (
    <>
      {!isStarted && (
        <>
          <div
            id="splash-container"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 0,
              background: "black",
            }}
          />
          <div
            id="start-pane"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              width: "280px",
            }}
          />
        </>
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
            <Broadcaster />
          </Canvas>
          {isMobile && (
            <MobileJoystick onMove={handleJoystickMove} onStop={handleJoystickStop} />
          )}
        </>
      )}
    </>
  );
}
