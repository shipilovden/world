import store from "./store";

export default function GridSettings(pane) {
  const grid = store.grid;

  const small = pane.addFolder({ title: "Small Grid" });
  small.addBinding(grid, "showSmall", { label: "Visible" }).on("change", () => {
    store.grid.showSmall = grid.showSmall;
  });
  small.addBinding(grid, "opacitySmall", { min: 0, max: 1 }).on("change", () => {
    store.grid.opacitySmall = grid.opacitySmall;
  });
  small.addBinding(grid, "colorSmall").on("change", () => {
    store.grid.colorSmall = grid.colorSmall;
  });

  const medium = pane.addFolder({ title: "Medium Grid" });
  medium.addBinding(grid, "showMedium", { label: "Visible" }).on("change", () => {
    store.grid.showMedium = grid.showMedium;
  });
  medium.addBinding(grid, "opacityMedium", { min: 0, max: 1 }).on("change", () => {
    store.grid.opacityMedium = grid.opacityMedium;
  });
  medium.addBinding(grid, "colorMedium").on("change", () => {
    store.grid.colorMedium = grid.colorMedium;
  });

  const large = pane.addFolder({ title: "Large Grid" });
  large.addBinding(grid, "showLarge", { label: "Visible" }).on("change", () => {
    store.grid.showLarge = grid.showLarge;
  });
  large.addBinding(grid, "opacityLarge", { min: 0, max: 1 }).on("change", () => {
    store.grid.opacityLarge = grid.opacityLarge;
  });
  large.addBinding(grid, "colorLarge").on("change", () => {
    store.grid.colorLarge = grid.colorLarge;
  });
}
