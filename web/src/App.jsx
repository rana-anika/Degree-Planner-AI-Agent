import { ChatKit, useChatKit } from "@openai/chatkit-react";

function Chat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;

        const res = await fetch("/api/chatkit-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: "demo-user" }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create ChatKit session");
        return data.client_secret;
      },
    },
  });

  return (
    <div style={{ height: "80vh" }}>
      <ChatKit control={control} style={{ height: "100%" }} />
    </div>
  );
}

export default function App() {
  return (
    <div style={{ maxWidth: 1000, margin: "24px auto", padding: 16 }}>
      <h2>ChatKit Workflow Demo v2</h2>
      <Chat />
    </div>
  );
}

