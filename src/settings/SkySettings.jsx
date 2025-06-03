// SkySettings.jsx
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import store from "./store";

export default function SkySettings(folder) {
  const sky = store.sky;

  // === Атмосфера ===
  folder.addBinding(sky, "turbidity", {
    min: 0,
    max: 20,
    step: 0.1,
    label: "Turbidity",
  }).on("change", () => sky.__needsUpdate = true);

  folder.addBinding(sky, "rayleigh", {
    min: 0,
    max: 10,
    step: 0.1,
    label: "Rayleigh",
  }).on("change", () => sky.__needsUpdate = true);

  folder.addBinding(sky, "mieCoefficient", {
    min: 0,
    max: 0.1,
    step: 0.001,
    label: "Mie Coefficient",
  }).on("change", () => sky.__needsUpdate = true);

  folder.addBinding(sky, "mieDirectionalG", {
    min: 0,
    max: 1,
    step: 0.01,
    label: "Mie Dir. G",
  }).on("change", () => sky.__needsUpdate = true);

  folder.addBinding(sky, "elevation", {
    min: 0,
    max: 90,
    step: 0.1,
    label: "Elevation",
  }).on("change", () => sky.__needsUpdate = true);

  folder.addBinding(sky, "azimuth", {
    min: 0,
    max: 360,
    step: 1,
    label: "Azimuth",
  }).on("change", () => sky.__needsUpdate = true);

  folder.addBinding(sky, "exposure", {
    min: 0,
    max: 2,
    step: 0.01,
    label: "Exposure",
  }).on("change", () => sky.__needsUpdate = true);

  // === Фон ===
  folder.addBinding(sky, "backgroundColor", {
    view: "color",
    label: "Background",
  }).on("change", () => sky.__needsUpdate = true);

  // === Env Map по URL ===
  folder.addBinding(sky, "environmentUrl", {
    label: "Env Map URL",
  }).on("change", () => {
    if (!sky.environmentUrl) return;
    new RGBELoader().load(sky.environmentUrl, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      sky.environmentMap = tex;
      sky.__needsUpdate = true;
    });
  });

  // === Загрузка HDR ===
  folder.addButton({ title: "Upload HDR" }).on("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".hdr,.exr";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        new RGBELoader().load(url, (tex) => {
          tex.mapping = THREE.EquirectangularReflectionMapping;
          tex.colorSpace = THREE.SRGBColorSpace;
          sky.environmentMap = tex;
          sky.__needsUpdate = true;
        });
      }
    };
    input.click();
  });

  // === Разделитель ===
  folder.addBlade({ view: "separator" });

  // === Сброс ===
  folder.addButton({ title: "Reset" }).on("click", () => {
    store.resetSky();
  });
}
