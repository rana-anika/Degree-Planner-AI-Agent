import { useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState(null);

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
        body: JSON.stringify({
          message: text,
          previousResponseId,
        }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Request failed");

      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
      setPreviousResponseId(data.previousResponseId);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Error: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    setPreviousResponseId(null);
  }

  return (
    <div style={{ maxWidth: 780, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Demo Agent</h2>

      <button onClick={newChat} style={{ marginBottom: 12 }}>
        New chat
      </button>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 14,
          minHeight: 360,
          marginBottom: 12,
          overflow: "auto",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "10px 0" }}>
            <b>{m.role === "user" ? "You" : "Agent"}:</b> {m.text}
          </div>
        ))}
        {loading && (
          <div>
            <b>Agent:</b> typing…
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />
        <button onClick={send} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

