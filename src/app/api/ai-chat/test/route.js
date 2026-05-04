/**
 * GET /api/ai-chat/test  — diagnostic for Groq key
 * Remove before production.
 */
export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    return Response.json({
      ok: false,
      problem: "GROQ_API_KEY is not set in .env.local",
      fix: [
        "1. Go to https://console.groq.com",
        "2. Sign in with Google or GitHub (free, instant)",
        "3. Click API Keys → Create API Key",
        "4. Add  GROQ_API_KEY=gsk_...  to your .env.local",
        "5. Restart: npm run dev",
      ],
    });
  }

  const models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
  ];

  const results = [];

  for (const model of models) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages:   [{ role: "user", content: "Reply with just the word OK" }],
          max_tokens: 5,
        }),
      });

      let body = {};
      try { body = await res.json(); } catch {}

      const reply = body.choices?.[0]?.message?.content ?? null;
      const err   = body.error?.message ?? null;
      results.push({ model, status: res.status, ok: res.ok, reply, error: err });
      if (res.ok) break;
    } catch (e) {
      results.push({ model, status: "network_error", error: e.message });
    }
  }

  const working = results.find((r) => r.ok);
  return Response.json({
    keyPrefix:      apiKey.slice(0, 14) + "...",
    workingModel:   working?.model ?? null,
    recommendation: working
      ? `✅ AI Chat is working! Model: ${working.model}`
      : "❌ No model worked — check your key at https://console.groq.com",
    results,
  });
}
