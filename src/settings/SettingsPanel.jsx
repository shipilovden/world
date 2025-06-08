import React, { useEffect, useRef, useState } from "react";
import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";

import GridSettings from "./GridSettings";
import GroundSettings from "./GroundSettings";
import SkySettings from "./SkySettings";
import FogSettings from "./FogSettings";
import VoxelSettings from "./VoxelsSettings";
import BroadcasterSettings from "./BroadcasterSettings";

export default function SettingsPanel() {
  const containerRef = useRef(null);
  const paneInstance = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible && containerRef.current) {
      if (paneInstance.current) {
        paneInstance.current.dispose();
        paneInstance.current = null;
      }

      const pane = new Pane({ container: containerRef.current });
      pane.registerPlugin(EssentialsPlugin); // 🔥 важно до .addFolder()

      const settings = pane.addFolder({ title: "⚙️ Settings", expanded: true });

      const grid = settings.addFolder({ title: "🧱 Grid", expanded: false });
      GridSettings(grid);

      const ground = settings.addFolder({ title: "🌍 Ground", expanded: false });
      GroundSettings(ground);

      const sky = settings.addFolder({ title: "🌌 Sky", expanded: false });
      SkySettings(sky);

      const fog = settings.addFolder({ title: "🌫️ Fog", expanded: false });
      FogSettings(fog);

      const voxels = settings.addFolder({ title: "🧊 Voxels", expanded: false });
      VoxelSettings(voxels);

      const broadcaster = settings.addFolder({ title: "📢 Broadcaster", expanded: false });

      console.log("broadcaster =", broadcaster); // ✅ отладка
      console.log("typeof broadcaster.addBinding =", typeof broadcaster.addBinding); // ✅ отладка

      BroadcasterSettings(broadcaster); // 🔥 тут проблема, если broadcaster не Folder
      paneInstance.current = pane;
    }

    return () => {
      if (paneInstance.current) {
        paneInstance.current.dispose();
        paneInstance.current = null;
      }
    };
  }, [visible]);

  return (
    <>
      <div
        onClick={() => setVisible(!visible)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          background: "#fff",
          borderRadius: "50%",
          boxShadow: "0 0 5px rgba(0,0,0,0.3)",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: visible ? "rotate(60deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease",
        }}
      >
        <span role="img" aria-label="settings">⚙️</span>
      </div>

      {visible && (
        <div
          ref={containerRef}
          style={{
            position: "absolute",
            top: 70,
            right: 20,
            zIndex: 1000,
            width: 300,
            maxHeight: "60vh",
            overflowY: "auto",
            background: "#fff",
            borderRadius: 5,
            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
            paddingRight: 4,
          }}
        />
      )}
    </>
  );
}
