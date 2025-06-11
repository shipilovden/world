import store from "./store";

export default function ShadowsSettings(folder) {
  const shadow = store.shadow;

  folder.addBinding(shadow, "enabled", {
    label: "Enable Shadows",
  }).on("change", () => {
    shadow.__needsUpdate = true;
  });
}
