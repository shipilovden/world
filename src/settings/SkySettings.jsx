import store from "./store";

export default function SkySettings(folder) {
  const sky = store.sky;

  folder.addBinding(sky, "turbidity", {
    min: 0,
    max: 20,
    step: 0.1,
    label: "Turbidity",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBinding(sky, "rayleigh", {
    min: 0,
    max: 10,
    step: 0.1,
    label: "Rayleigh",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBinding(sky, "mieCoefficient", {
    min: 0,
    max: 0.1,
    step: 0.001,
    label: "Mie Coefficient",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBinding(sky, "mieDirectionalG", {
    min: 0,
    max: 1,
    step: 0.01,
    label: "Mie Dir. G",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBinding(sky, "elevation", {
    min: 0,
    max: 90,
    step: 0.1,
    label: "Elevation",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBinding(sky, "azimuth", {
    min: 0,
    max: 360,
    step: 1,
    label: "Azimuth",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBinding(sky, "exposure", {
    min: 0,
    max: 2,
    step: 0.01,
    label: "Exposure",
  }).on("change", () => (sky.__needsUpdate = true));

  // ТУМАН
  folder.addBinding(sky, "fogNear", {
    min: 0,
    max: 100,
    step: 1,
    label: "Fog Near",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBinding(sky, "fogFar", {
    min: 10,
    max: 1000,
    step: 1,
    label: "Fog Far",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBinding(sky, "fogColor", {
    view: "color",
    label: "Fog Color",
  }).on("change", () => (sky.__needsUpdate = true));

  folder.addBlade({ view: "separator" });

  folder.addButton({ title: "Reset" }).on("click", () => {
    store.resetSky();
  });
}
