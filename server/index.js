import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.get("/", (req, res) => {
  res.send("OK - server is running. POST to /api/chat");
});
app.post("/api/chatkit/session", async (req, res) => {
  try {
    const workflowId = process.env.CHATKIT_WORKFLOW_ID;
    if (!workflowId) {
      return res.status(500).json({ error: "Missing CHATKIT_WORKFLOW_ID env var" });
    }

    // Create a ChatKit session and return the client_secret to the browser
    const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        workflow: { id: workflowId },
        // simple local user identifier; replace later if you want auth
        user: "local-dev-user",
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: `ChatKit session create failed: ${text}` });
    }

    const data = await r.json();
    return res.json({ client_secret: data.client_secret });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error creating ChatKit session" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Minimal example using Responses API
    const response = await client.responses.create({
      model: "gpt-5.2",
      input: [
        ...history,
        { role: "user", content: message }
      ],
    });

    // Pull a simple text output (you can enhance later)
    const text = response.output_text ?? "";
    res.json({ reply: text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(8787, () => console.log("Server running on http://localhost:8787"));


