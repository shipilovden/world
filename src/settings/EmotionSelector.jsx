import React, { useState, useRef, useEffect } from "react";

export default function EmotionSelector({ onSelect }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const emotions = [
    { label: "💃 Dance", key: "dance" },
    { label: "🪑 Sit", key: "sit" },
    { label: "🤾 Jump", key: "jump" },
    { label: "👏 Clap", key: "clap" },
    { label: "👉 Point", key: "point" },
    { label: "👋 Wave", key: "wave" },
    { label: "😵 Fall", key: "fall" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-block", userSelect: "none" }}
    >
      <button
        onClick={() => setOpen(!open)}
        title="Select Emotion"
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
        😊 Emotions
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "120%",
            right: 0,
            backgroundColor: "#222",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            minWidth: "140px",
            zIndex: 9999,
            userSelect: "none",
          }}
        >
          {emotions.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => {
                onSelect && onSelect(key);
                setOpen(false);
              }}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#fff",
                padding: "8px 12px",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: "6px",
                fontSize: "16px",
                userSelect: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
