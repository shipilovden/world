// FogSettings.jsx
import store from "./store";

export default function FogSettings(folder) {
  const fog = store.fog;

  folder.addBinding(fog, "fogEnabled", {
    label: "Enable Fog",
  }).on("change", () => fog.__needsUpdate = true);

  folder.addBinding(fog, "fogMode", {
    options: {
      linear: "linear",
      exp: "exp",
      exp2: "exp2",
    },
    label: "Fog Mode",
  }).on("change", () => fog.__needsUpdate = true);

  folder.addBinding(fog, "fogDensity", {
    min: 0,
    max: 0.05,
    step: 0.001,
    label: "Fog Density",
  }).on("change", () => fog.__needsUpdate = true);

  folder.addBinding(fog, "fogNear", {
    min: 0,
    max: 100,
    step: 1,
    label: "Fog Near",
  }).on("change", () => fog.__needsUpdate = true);

  folder.addBinding(fog, "fogFar", {
    min: 10,
    max: 1000,
    step: 1,
    label: "Fog Far",
  }).on("change", () => fog.__needsUpdate = true);

  folder.addBinding(fog, "fogColor", {
    view: "color",
    label: "Fog Color",
  }).on("change", () => fog.__needsUpdate = true);

  folder.addBlade({ view: "separator" });

  folder.addButton({ title: "Reset Fog" }).on("click", () => {
    store.resetFog();
  });
}
