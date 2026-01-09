import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WORKFLOW_ID =
  "wf_6955803ef6948190902b2a0ef11580cb0d7af03ab398e873";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const user = req.body?.user || "demo-user";

    // ✅ ChatKit is under the beta namespace in the SDK
    const session = await client.beta.chatkit.sessions.create({
      workflow: { id: WORKFLOW_ID },
      user,
    });

    return res.status(200).json({ client_secret: session.client_secret });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err?.message || "Failed to create session" });
  }
}

