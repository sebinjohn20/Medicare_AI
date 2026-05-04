/**
 * GET /api/ai-chat/debug
 * Shows exactly what key is loaded. Remove after fixing.
 */
export async function GET() {
  const groq = process.env.GROQ_API_KEY ?? "NOT SET";

  return Response.json({
    GROQ_API_KEY_loaded: groq === "NOT SET" ? "❌ NOT SET" : "✅ Found",
    key_preview:         groq.length > 10 ? groq.slice(0, 14) + "..." : groq,
    key_length:          groq.length,
    starts_with_gsk:     groq.startsWith("gsk_"),
    verdict: groq === "NOT SET"
      ? "❌ Key missing — add GROQ_API_KEY=gsk_xxx to .env.local then restart npm run dev"
      : !groq.startsWith("gsk_")
      ? "❌ Key doesn't start with gsk_ — copy the full key from console.groq.com"
      : "✅ Key looks valid — test at /api/ai-chat/test",
  });
}
