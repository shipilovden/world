import React from "react";
import { Joystick } from "react-joystick-component";

export default function MobileJoystick({ onMove, onStop }) {
  return (
    <div style={{ position: "absolute", bottom: 40, left: 40, zIndex: 1000 }}>
      <Joystick
        size={80}
        baseColor="#ccc"
        stickColor="#555"
        throttle={100}
        move={onMove}
        stop={onStop}
      />
    </div>
  );
}
