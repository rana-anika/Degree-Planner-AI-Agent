import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: pull the first output_text from a Responses API response
function getOutputText(resp) {
  const msg = resp.output?.find((o) => o.type === "message");
  const textPart = msg?.content?.find((c) => c.type === "output_text");
  return textPart?.text ?? "";
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    const { message, previousResponseId } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing `message`" });
    }

    // For demo: put your Agent Builder “Instructions” here
    // (Copy/paste from the builder so the model behaves like your agent)
    const instructions = process.env.AGENT_INSTRUCTIONS || "You are a helpful demo agent.";

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions,
      input: message,
      // Optional: keep state across turns without resending full chat
      previous_response_id: previousResponseId || undefined,
    });

    const reply = getOutputText(response);

    return res.status(200).json({
      reply,
      previousResponseId: response.id, // send this back to continue the thread
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

