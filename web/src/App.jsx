import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState(null);

  const chatRef = useRef(null);

  useEffect(() => {
    // auto-scroll to bottom
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, previousResponseId }),
      });

      // IMPORTANT: show better error if server returned HTML instead of JSON
      const contentType = r.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const html = await r.text();
        throw new Error(
          `Backend did not return JSON. Got: ${contentType}. First chars: ${html.slice(0, 60)}`
        );
      }

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Request failed");

      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
      setPreviousResponseId(data.previousResponseId);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    setPreviousResponseId(null);
  }

  return (
    <div className="app">
      <div className="shell">
        <div className="header">
          <h1 className="title">Demo Agent</h1>
          <button className="btn" onClick={newChat}>New chat</button>
        </div>

        <div className="chat" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={`row ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="row assistant">
              <div className="bubble">typing…</div>
            </div>
          )}
        </div>

        <div className="composer">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
          />
          <button className="send" onClick={send} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

