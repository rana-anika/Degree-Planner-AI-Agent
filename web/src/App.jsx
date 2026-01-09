import "./App.css";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

function MyChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // keep it simple for local dev: always create a new session
        // (you can implement refresh later)
        const res = await fetch("http://localhost:8787/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
  });

  return (
    <div style={{ height: 600, width: 360 }}>
      <ChatKit control={control} className="h-[600px] w-[360px]" />
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Local Agent Demo (ChatKit)</h2>
      <MyChat />
    </div>
  );
}

