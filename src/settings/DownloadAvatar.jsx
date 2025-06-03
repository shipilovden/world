import React from "react";

export default function DownloadAvatar({ onLoad }) {
  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".glb,.vrm";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (onLoad) onLoad(url, file.name);
    };
    input.click();
  };

  return (
    <button
      onClick={handleUpload}
      title="Load Avatar (GLB/VRM)"
      style={{
        fontSize: "24px",
        padding: "8px 16px",
        cursor: "pointer",
        backgroundColor: "#222",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 0 6px rgba(0,0,0,0.8)",
        transition: "background-color 0.3s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#222")}
    >
      👤 Load Avatar
    </button>
  );
}