import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { marked } from "marked";

// Контекст чата
const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat-messages");
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState("dark");

  const sendMessage = (text) => {
    if (text.trim() === "") return;
    const newMessage = { id: Date.now(), text };
    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem("chat-messages", JSON.stringify(updated));
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem("chat-messages");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const exportMessages = () => {
    const text = messages.map((m) => m.text).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chat.txt";
    a.click();
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        clearMessages,
        theme,
        toggleTheme,
        exportMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

export default function Chat() {
  const chat = useChat() || {};
  const { messages } = chat;

  const {
    sendMessage,
    clearMessages,
    // theme, // Удаляем theme
    // toggleTheme, // Удаляем toggleTheme
    // exportMessages, // Удаляем exportMessages
  } = useChat();

  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [transparent, setTransparent] = useState(true);
  const [wasDragged, setWasDragged] = useState(false); // Добавляем новое состояние
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const chatBtnRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Позиционирование панели при открытии ---
  useEffect(() => {
    if (isOpen && chatBtnRef.current && panelRef.current) {
      const btnRect = chatBtnRef.current.getBoundingClientRect();
      setPanelPos({
        top: btnRect.top + window.scrollY,
        left: btnRect.left + window.scrollX,
      });
    }
  }, [isOpen, isMobile]);

  // --- Drag & Drop ---
  const onDragStart = (e) => {
    if (isMobile) return;
    setDragging(true);
    setWasDragged(true); // <- отмечаем, что был drag
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    setPanelPos({
      left: clientX - dragOffset.x,
      top: clientY - dragOffset.y,
    });
  };

  const onDragEnd = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", onDragEnd);
      window.addEventListener("touchmove", onDrag);
      window.addEventListener("touchend", onDragEnd);
    } else {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
      window.removeEventListener("touchmove", onDrag);
      window.removeEventListener("touchend", onDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onDragEnd);
      window.removeEventListener("touchmove", onDrag);
      window.removeEventListener("touchend", onDragEnd);
    };
  }, [dragging]);

  const handleSend = () => {
    sendMessage(input);
    setInput("");
    setIsTyping(false);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    setIsTyping(true);
    if (e.key === "Enter") handleSend();
  };

  const toggleChat = () => setIsOpen((prev) => !prev);

  const addEmoji = (emoji) => setInput((prev) => prev + emoji);

  // --- Категории эмодзи ---
  const emojiCategories = {
    "Смайлы": [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉",
      "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "🤗", "🤔", "🤩", "🤨", "🧐", "😎",
      "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩",
      "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨",
      "😰", "😥", "😓", "🤤", "😴", "💤", "🤒", "🤕", "🤢", "🤮", "🤧", "😷", "🤠",
      "🤓", "🤑", "🤡", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃"
    ],
    "Животные": [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷",
      "🐸", "🐵", "🦄", "🐔", "🐧", "🐦", "🐤", "🐣", "🦆", "🦅", "🦉", "🦇", "🐺"
    ],
    "Еда": [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑",
      "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕"
    ],
    "Жесты": [
      "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "🖖", "👏", "🙌", "👐", "🤲",
      "🙏", "💪", "🦾", "🦵", "🦶", "👀", "👁️", "👅", "👄", "💋"
    ],
    "Символы": [
      "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️", "🧡", "💛",
      "💚", "💙", "💜", "🤎", "🖤", "🤍", "💯", "💢", "💥", "💫", "💦", "💨", "🕳️",
      "💣", "💬", "👋"
    ],
    "Природа": [
      "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️", "☃️",
      "⛄", "🌬️", "💨", "🌪️", "🌫️", "🌈", "🌂", "☔", "⚡", "🔥", "💧", "🌊"
    ]
  };

  const emojiCategoryNames = Object.keys(emojiCategories);

  const [emojiTab, setEmojiTab] = useState(emojiCategoryNames[0]);

  const isImageLink = (text) =>
    text.match(/\.(jpeg|jpg|gif|png|webp)$/i) && text.startsWith("http");

  return (
    <>
      <button
        ref={chatBtnRef}
        style={isMobile ? styles.buttonMobile : styles.buttonDesktop}
        onClick={toggleChat}
        title="Чат"
      >
        💬
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          style={{
            ...(isMobile ? styles.panelMobile : styles.panelDesktop),
            position: "fixed",
            left: (!isMobile && wasDragged) ? panelPos.left : "50%",
            top: (!isMobile && wasDragged) ? panelPos.top : "unset",
            bottom: (!isMobile && wasDragged) ? "unset" : (isMobile ? "150px" : "40px"),
            right: "unset",
            transform:
              (!isMobile && wasDragged)
                ? "none"
                : "translateX(-50%)",
            background: transparent ? "rgba(0,0,0,0.3)" : "#222",
            color: "#fff",
            cursor: dragging && !isMobile ? "move" : "default",
            userSelect: dragging && !isMobile ? "none" : "auto",
            zIndex: 1002,
          }}
        >
          <div
            style={styles.header}
            onMouseDown={!isMobile ? onDragStart : undefined}
            onTouchStart={!isMobile ? onDragStart : undefined}
          >
            <button onClick={clearMessages}>🧹</button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} style={styles.message}>
                {isImageLink(msg.text) ? (
                  <img
                    src={msg.text}
                    alt="img"
                    style={{ maxWidth: "100%", borderRadius: "4px" }}
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(msg.text),
                    }}
                  />
                )}
              </div>
            ))}
            {isTyping && <div style={styles.typing}>Печатает...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputContainer}>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              😊
            </button>
            {showEmojiPicker && (
              <div style={styles.emojiPicker}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
                  {emojiCategoryNames.map((cat) => (
                    <button
                      key={cat}
                      style={{
                        ...styles.emojiTab,
                        background: emojiTab === cat ? "#333" : "none",
                        color: emojiTab === cat ? "#fff" : "#aaa"
                      }}
                      onClick={() => setEmojiTab(cat)}
                      type="button"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {emojiCategories[emojiTab].map((emoji, i) => (
                    <button
                      key={emoji + i}
                      style={styles.emojiOption}
                      onClick={() => addEmoji(emoji)}
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input
              style={{
                ...styles.input,
                background: "#111",
                color: "#fff",
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
            />
            <button style={styles.sendButton} onClick={handleSend}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// --- Стили ---
const basePanel = {
  position: "absolute",
  fontFamily: "sans-serif",
  borderRadius: "10px",
  zIndex: 1000,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const styles = {
  buttonDesktop: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    fontSize: "22px",
    color: "#fff",
    background: "none", // убираем круг
    border: "none",
    boxShadow: "none",
    outline: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    zIndex: 1001,
  },
  buttonMobile: {
    position: "absolute",
    bottom: 110, // Меньше — выше, больше — ниже
    left: 20,
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    fontSize: "22px",
    color: "#fff",
    background: "none", // убираем круг
    border: "none",
    boxShadow: "none",
    outline: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    zIndex: 1001,
  },
  panelDesktop: {
    ...basePanel,
    width: "320px",
    maxHeight: "360px",
  },
  panelMobile: {
    ...basePanel,
    width: "95vw",
    maxWidth: "400px",
    height: "50vh",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "5px 10px",
    gap: "5px",
  },
  messages: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    fontSize: "14px",
  },
  message: {
    marginBottom: "6px",
    wordBreak: "break-word",
  },
  typing: {
    fontSize: "12px",
    opacity: 0.6,
    padding: "4px 10px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    borderTop: "1px solid #444",
    padding: "5px",
    gap: "5px",
    position: "relative",
  },
  input: {
    flex: 1,
    padding: "8px",
    border: "none",
    outline: "none",
    borderRadius: "6px",
    fontSize: "14px",
  },
  sendButton: {
    padding: "8px 12px",
    background: "#444",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  emojiPicker: {
    position: "absolute",
    bottom: "40px",
    left: "0",
    background: "#222",
    padding: "5px",
    display: "flex",
    flexWrap: "wrap",
    maxWidth: "100%",
    maxHeight: "150px",
    overflowY: "auto",
    borderRadius: "6px",
    zIndex: 1002,
  },
  emojiOption: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "2px",
  },
  emojiTab: {
    border: "none",
    borderRadius: "4px",
    padding: "2px 8px",
    marginRight: "2px",
    cursor: "pointer",
    fontSize: "13px",
    background: "none",
    color: "#aaa",
    transition: "background 0.2s,color 0.2s"
  },
};
