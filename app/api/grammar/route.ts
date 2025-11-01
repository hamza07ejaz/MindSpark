import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, tone } = await req.json();
    if (!text || !String(text).trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const system = [
      "You are a writing editor.",
      "Fix grammar, punctuation, and style.",
      "Preserve meaning and details.",
      "Return strict JSON with keys: corrected, changes.",
      "changes is an array of objects with keys: from, to, reason.",
      "Keep the tone requested exactly.",
    ].join(" ");

    const user = [
      `Tone: ${tone || "Academic"}`,
      "Text:",
      String(text),
    ].join("\n");

    // OpenAI Chat Completions JSON-only instruction
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("OpenAI error:", errText);
      // Fallback: return original text
      return NextResponse.json({ corrected: text, changes: [] }, { status: 200 });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content || "";
    let out: { corrected?: string; changes?: any[] } = {};
    try {
      out = JSON.parse(raw);
    } catch {
      // If model returned non-JSON despite response_format, fallback
      out = { corrected: raw || text, changes: [] };
    }

    return NextResponse.json(
      {
        corrected: out.corrected ?? text,
        changes: Array.isArray(out.changes) ? out.changes.slice(0, 25) : [],
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ corrected: "", changes: [] }, { status: 200 });
  }
}
