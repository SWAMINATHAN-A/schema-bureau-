
export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured." });
    }

    const { question, schema = null } = req.body || {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "A question is required." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are SCHEMA BUREAU Intelligence, an expert database architect and teacher. Explain database concepts accurately using the supplied SQL schema. Give concise, clear answers and SQL examples when useful."
          },
          {
            role: "user",
            content: `CURRENT SCHEMA:\n${JSON.stringify(schema, null, 2)}\n\nQUESTION:\n${question}`
          }
        ],
        temperature: 0.25,
        max_completion_tokens: 1600
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", response.status, data?.error?.message);
      return res.status(response.status >= 500 ? 502 : response.status).json({
        error: data?.error?.message || `Groq request failed (${response.status}).`
      });
    }

    return res.status(200).json({
      content: data?.choices?.[0]?.message?.content || "Groq returned an empty response."
    });
  } catch (error) {
    console.error("Groq function error:", error);
    return res.status(500).json({ error: "The AI request failed. Check Vercel function logs." });
  }
}
