import store from "./store";

export default function VoxelsSettings(folder) {
  // 👉 Кнопка добавления вокселя
  folder.addButton({ title: "➕ Добавить воксель" }).on("click", () => {
    store.addVoxel();
  });

  // 👉 Кнопка удаления выбранного вокселя
  folder.addButton({ title: "🗑 Удалить воксель" }).on("click", () => {
    const id = store.getSelectedVoxelId();
    if (id) {
      store.removeVoxel(id);
    }
  });

  // 🎯 Получение выбранного вокселя
  const voxelId = store.getSelectedVoxelId();
  const voxel = store.voxels.items.find((v) => v.id === voxelId);

  if (!voxel || !voxel.position || !voxel.scale) return;

  const settings = folder.addFolder({ title: "🎛 Настройки", expanded: true });

  // 🔧 Позиция
  settings.addBinding(voxel.position, "x", {
    min: -50,
    max: 50,
    step: 0.1,
    label: "Pos X",
  }).on("change", () => {
    store.updateVoxel(voxel.id, { position: { ...voxel.position } });
  });

  settings.addBinding(voxel.position, "y", {
    min: 0,
    max: 50,
    step: 0.1,
    label: "Pos Y",
  }).on("change", () => {
    store.updateVoxel(voxel.id, { position: { ...voxel.position } });
  });

  settings.addBinding(voxel.position, "z", {
    min: -50,
    max: 50,
    step: 0.1,
    label: "Pos Z",
  }).on("change", () => {
    store.updateVoxel(voxel.id, { position: { ...voxel.position } });
  });

  // 🔧 Масштаб
  settings.addBinding(voxel.scale, "x", {
    min: 0.1,
    max: 10,
    step: 0.1,
    label: "Scale X",
  }).on("change", () => {
    store.updateVoxel(voxel.id, { scale: { ...voxel.scale } });
  });

  settings.addBinding(voxel.scale, "y", {
    min: 0.1,
    max: 10,
    step: 0.1,
    label: "Scale Y",
  }).on("change", () => {
    store.updateVoxel(voxel.id, { scale: { ...voxel.scale } });
  });

  settings.addBinding(voxel.scale, "z", {
    min: 0.1,
    max: 10,
    step: 0.1,
    label: "Scale Z",
  }).on("change", () => {
    store.updateVoxel(voxel.id, { scale: { ...voxel.scale } });
  });

  // 🎨 Цвет
  settings.addBinding(voxel, "color", {
    view: "color",
    label: "Цвет",
  }).on("change", () => {
    store.updateVoxel(voxel.id, { color: voxel.color });
  });
}
