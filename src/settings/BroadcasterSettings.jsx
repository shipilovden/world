import store from "./store";

export default function BroadcasterSettings(folder) {
  const broadcaster = store.broadcaster;

  try {
    // === Громкость
    folder.addBinding(broadcaster, "volume", {
      min: 0, max: 1, step: 0.01, label: "🔊 Volume"
    }).on("change", () => {
      broadcaster.__needsUpdate = true;
    });

    // === Радиус
    folder.addBinding(broadcaster, "distance", {
      min: 1, max: 100, step: 1, label: "📡 Distance"
    }).on("change", () => {
      broadcaster.__needsUpdate = true;
    });

    // === Режим TransformControls
    folder.addBinding(broadcaster, "mode", {
      label: "🎮 Mode",
      options: {
        Translate: "translate",
        Rotate: "rotate",
        Scale: "scale",
      }
    }).on("change", () => {
      broadcaster.__needsUpdate = true;
    });

    // === Микрофон
    folder.addBinding(broadcaster, "micEnabled", {
      label: "🎤 Mic"
    }).on("change", () => {
      broadcaster.__needsUpdate = true;
    });

    // === Загрузка аудио с компьютера
    folder.addButton({ title: "📁 Upload Audio" }).on("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";

      input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        broadcaster.url = url;
        broadcaster.currentTrack = file.name;
        broadcaster.play = true;
        broadcaster.__needsUpdate = true;

        console.log("🎧 Загрузили аудио:", file.name);
      });

      input.click();
    });

    // === URL аудио
    folder.addBinding(broadcaster, "url", { label: "🌐 Audio URL" }).on("change", () => {
      broadcaster.__needsUpdate = true;
    });

    // === Название трека
    folder.addBinding(broadcaster, "currentTrack", {
      label: "🎵 Track",
      readonly: true,
    });

    // === Кнопка ADD
    folder.addButton({ title: "➕ Add" }).on("click", () => {
      broadcaster.active = true;
      broadcaster.__needsUpdate = true;
      console.log("📢 Добавлен объект");
    });

    // === Кнопка Play
    folder.addButton({ title: "▶ Play" }).on("click", () => {
      broadcaster.play = true;
      broadcaster.__needsUpdate = true;
      console.log("▶ Воспроизведение");
    });

    // === Кнопка Pause
    folder.addButton({ title: "⏸ Pause" }).on("click", () => {
      broadcaster.pause = true;
      broadcaster.__needsUpdate = true;
      console.log("⏸ Пауза");
    });

    // === Кнопка Delete
    folder.addButton({ title: "🗑 Delete" }).on("click", () => {
      broadcaster.remove = true;
      broadcaster.__needsUpdate = true;
      console.log("🗑 Удалён объект");
    });

  } catch (err) {
    console.error("❌ Error in BroadcasterSettings.jsx:", err);
  }
}
