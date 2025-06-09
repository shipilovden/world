import store from "./store";

export default function GridSettings(folder) {
  const grid = store.grid;

  folder.addBinding(grid, "enabled", {
    label: "✅ Show Grid",
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "infiniteGrid", {
    label: "♾ Infinite",
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "followCamera", {
    label: "🎥 Follow Camera",
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "cellSize", {
    label: "▫ Cell Size",
    min: 0.1,
    max: 10,
    step: 0.1,
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "cellThickness", {
    label: "▫ Cell Thickness",
    min: 0.01,
    max: 5,
    step: 0.01,
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "cellColor", {
    label: "▫ Cell Color",
    view: "color",
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "sectionSize", {
    label: "▣ Section Size",
    min: 0.1,
    max: 10,
    step: 0.1,
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "sectionThickness", {
    label: "▣ Section Thickness",
    min: 0.01,
    max: 5,
    step: 0.01,
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "sectionColor", {
    label: "▣ Section Color",
    view: "color",
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "fadeDistance", {
    label: "🌫 Fade Distance",
    min: 0,
    max: 100,
    step: 1,
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "fadeStrength", {
    label: "🌫 Fade Strength",
    min: 0,
    max: 1,
    step: 0.01,
  }).on("change", () => {
    grid.__needsUpdate = true;
  });

  folder.addBinding(grid, "fadeFrom", {
    label: "🎯 Fade Origin",
    min: 0,
    max: 1,
    step: 0.01,
  }).on("change", () => {
    grid.__needsUpdate = true;
  });
}
