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

  // 🧪 Цвет + Пипетка в одной строке
  const row = folder.addFolder({ title: "", expanded: true });

  const blade = row.addBinding(fog, "fogColor", {
    view: "color",
    label: "Fog Color",
  });
  const pipette = row.addButton({ title: "🧪" });

  // Стилируем кнопку пипетки как иконку справа
  setTimeout(() => {
    const parent = blade.controller.view.element.parentElement;
    pipette.controller.view.element.style.marginLeft = "8px";
    pipette.controller.view.element.style.width = "24px";
    pipette.controller.view.element.style.height = "24px";
    pipette.controller.view.element.style.padding = "0";
    pipette.controller.view.element.style.border = "1px solid #444";
    pipette.controller.view.element.style.borderRadius = "4px";
    pipette.controller.view.element.style.background = "#222";
    pipette.controller.view.element.style.cursor = "pointer";
    pipette.controller.view.element.title = "Pick from screen";

    // Переместим кнопку рядом с цветом
    parent?.appendChild(pipette.controller.view.element);
  });

  pipette.on("click", async () => {
    if (!window.EyeDropper) {
      alert("Your browser does not support EyeDropper API");
      return;
    }

    const eyeDropper = new window.EyeDropper();
    try {
      const result = await eyeDropper.open();
      fog.fogColor = result.sRGBHex;
      fog.__needsUpdate = true;
    } catch (e) {
      console.warn("EyeDropper cancelled", e);
    }
  });

  folder.addBlade({ view: "separator" });

  folder.addButton({ title: "Reset Fog" }).on("click", () => {
    store.resetFog();
  });
}
