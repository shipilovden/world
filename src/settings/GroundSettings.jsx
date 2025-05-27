import * as THREE from "three";
import store from "./store";

export default function GroundSettings(folder) {
  const ground = store.ground;

  // === Основные параметры ===
  const bindings = [
    { key: "color", options: { view: "color", label: "Color" } },
    { key: "opacity", options: { min: 0, max: 5, step: 0.01, label: "Opacity" } },
    { key: "roughness", options: { min: 0, max: 5, step: 0.01, label: "Roughness" } },
    { key: "metalness", options: { min: 0, max: 1, step: 0.01, label: "Metalness" } },
    { key: "aoMapIntensity", options: { min: 0, max: 5, step: 0.01, label: "AO Intensity" } },
    { key: "normalScale", options: { min: 0, max: 5, step: 0.01, label: "Normal Scale" } },
    { key: "displacementScale", options: { min: 0, max: 2, step: 0.01, label: "Displacement Scale" } },
    { key: "textureScaleX", options: { min: 0.1, max: 1000, step: 0.1, label: "Texture Scale X" } },
    { key: "textureScaleY", options: { min: 0.1, max: 1000, step: 0.1, label: "Texture Scale Y" } },
    { key: "uvOffsetX", options: { min: -1, max: 1, step: 0.01, label: "UV Offset X" } },
    { key: "uvOffsetY", options: { min: -1, max: 1, step: 0.01, label: "UV Offset Y" } },
  ];

  bindings.forEach(({ key, options }) => {
    folder.addBinding(ground, key, options).on("change", () => {
      ground.__needsUpdate = true;
    });
  });

  // === Загрузка текстуры по URL ===
  folder.addBinding(ground, "textureUrl", {
    label: "Load Texture URL",
  }).on("change", () => {
    if (!ground.textureUrl) return;
    new THREE.TextureLoader().load(
      ground.textureUrl,
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        if (ground.texture) ground.texture.dispose();
        ground.texture = tex;
        ground.__needsUpdate = true;
      },
      undefined,
      (err) => console.error(`Error loading texture from URL: ${ground.textureUrl}`, err)
    );
  });

  // === Карты ===
  const maps = [
    { label: "Base map", key: "texture", srgb: true },
    { label: "Normal map", key: "normalMap" },
    { label: "Roughness map", key: "roughnessMap" },
    { label: "AO map", key: "aoMap" },
    { label: "Metalness map", key: "metalnessMap" },
    { label: "Height map", key: "heightMap" },
  ];

  maps.forEach(({ label, key, srgb }) => {
    folder.addButton({ title: "Upload", label }).on("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        new THREE.TextureLoader().load(
          url,
          (tex) => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
            if (ground[key]) ground[key].dispose?.();
            ground[key] = tex;
            ground.__needsUpdate = true;
          },
          undefined,
          (err) => console.error(`Error loading ${label}:`, err)
        );
      };
      input.click();
    });
  });

  // === Flip X/Y ===
  folder.addButton({ title: "Flip X" }).on("click", () => {
    ground.flipX = !ground.flipX;
    ground.__needsUpdate = true;
  });

  folder.addButton({ title: "Flip Y" }).on("click", () => {
    ground.flipY = !ground.flipY;
    ground.__needsUpdate = true;
  });

  // === Разделитель ===
  folder.addBlade({ view: "separator" });

  // === Reset ===
  folder.addButton({ title: "Reset" }).on("click", () => {
    try {
      store.resetGround();
    } catch (err) {
      console.error("Error resetting ground settings:", err);
    }
  });
}
