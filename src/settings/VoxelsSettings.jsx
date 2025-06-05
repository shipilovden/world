import * as THREE from "three";
import store from "./store";

export default function VoxelsSettings(folder) {
  folder.addButton({ title: "➕ Add Voxel" }).on("click", () => {
    store.addVoxel();
  });

  const deleteButton = folder.addButton({ title: "🗑 Delete Voxel" }).on("click", () => {
    const id = store.getSelectedVoxelId();
    if (id) store.removeVoxel(id);
  });

  const dummy = {
    id: null,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    uniformScale: 1,
    color: "#ffffff",
  };

  const getVoxel = () => {
    const id = store.getSelectedVoxelId();
    return store.voxels.items.find((v) => v.id === id) || dummy;
  };

  const settings = folder.addFolder({ title: "🎛 Voxel Settings", expanded: true });

  const bind = (obj, key, label, min, max, step, type = "number", onChange) => {
    const binding = settings.addBinding(obj, key, {
      label,
      min,
      max,
      step,
      view: type === "color" ? "color" : undefined,
    });

    binding.on("change", (ev) => {
      const voxel = getVoxel();
      if (!voxel.id) return;

      if (onChange) {
        onChange(ev, voxel);
      } else {
        const update = {};
        update[key] = ev.value;
        store.updateVoxel(voxel.id, update);
      }
    });

    return binding;
  };

  const positionBindings = ["x", "y", "z"].map((axis) =>
    bind(getVoxel().position, axis, `Pos ${axis.toUpperCase()}`, -50, 50, 0.1, "number", (ev, voxel) => {
      const newPosition = { ...voxel.position };
      newPosition[axis] = ev.value;
      store.updateVoxel(voxel.id, { position: newPosition });
    })
  );

  const rotationBindings = ["x", "y", "z"].map((axis) =>
    bind(getVoxel().rotation, axis, `Rot ${axis.toUpperCase()}`, -180, 180, 1, "number", (ev, voxel) => {
      const newRotation = { ...voxel.rotation };
      newRotation[axis] = ev.value;
      store.updateVoxel(voxel.id, { rotation: newRotation });
    })
  );

  const scaleBindings = ["x", "y", "z"].map((axis) =>
    bind(getVoxel().scale, axis, `Scale ${axis.toUpperCase()}`, 0.1, 10, 0.1, "number", (ev, voxel) => {
      const newScale = { ...voxel.scale };
      newScale[axis] = ev.value;
      store.updateVoxel(voxel.id, { scale: newScale });
    })
  );

  // Исправляем Uniform Scale - обновляем и uniformScale и индивидуальные scale значения
  const uniformScaleBinding = bind(
    getVoxel(), 
    "uniformScale", 
    "Uniform Scale", 
    0.1, 
    10, 
    0.1, 
    "number", 
    (ev, voxel) => {
      const uniformValue = ev.value;
      store.updateVoxel(voxel.id, { 
        uniformScale: uniformValue,
        scale: { 
          x: uniformValue, 
          y: uniformValue, 
          z: uniformValue 
        }
      });
    }
  );

  // Исправляем Color - используем тот же подход с кастомным onChange
  const colorBinding = bind(
    getVoxel(), 
    "color", 
    "Color", 
    0, 
    0, 
    0, 
    "color", 
    (ev, voxel) => {
      store.updateVoxel(voxel.id, { color: ev.value });
    }
  );

  const textureButton = settings.addButton({ title: "📤 Upload Texture" }).on("click", () => {
    const voxel = getVoxel();
    if (!voxel.id) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const loader = new THREE.TextureLoader();
      loader.load(url, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        store.updateVoxel(voxel.id, { texture });
      });
    };
    input.click();
  });

  // Перерисовка значений каждые 200мс
  setInterval(() => {
    const voxel = getVoxel();

    [...positionBindings, ...rotationBindings, ...scaleBindings].forEach((binding) => binding.refresh());
    uniformScaleBinding.refresh();
    colorBinding.refresh();

    const hasSelection = !!voxel.id;
    deleteButton.disabled = !hasSelection;
    textureButton.disabled = !hasSelection;
  }, 200);
}
