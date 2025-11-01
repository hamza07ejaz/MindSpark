import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, slides = 10 } = await req.json();

    const prompt = `
You are SlideCraft, an elite slide writer. Create a JSON with exactly this shape:
{
  "slides": [
    { "title": "...", "bullets": ["...", "...", "..."], "notes": "..." }
  ]
}

Rules:
- 10–12 slides max.
- Titles short and informative.
- Bullets: concrete facts, cause→effect, definitions, examples, stats if relevant.
- No markdown symbols (#, *, -). Plain text only.
- Keep bullets punchy (5–12 words).
- First slide = title slide. Final slide = summary / next steps.
Topic: "${topic}"
`;

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: "Respond with STRICT JSON only. No prose." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_output_tokens: 2000,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: "Upstream error", detail: txt }, { status: 500 });
    }

    const data = await resp.json();

    // The Responses API returns content in data.output[0].content[0].text for text blocks
    let raw = "";
    try {
      raw =
        data?.output?.[0]?.content?.find((c: any) => c.type === "output_text")?.text ||
        data?.output_text ||
        "";
    } catch {
      raw = "";
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      // fallback minimal
      json = {
        slides: [
          { title: topic, bullets: ["Overview", "Why it matters", "What you’ll learn"], notes: "" },
          { title: "Core Concepts", bullets: ["Concept A", "Concept B", "Concept C"], notes: "" },
        ],
      };
    }

    // hard cap & sanitize
    const clean = Array.isArray(json.slides)
      ? json.slides.slice(0, Math.min(Number(slides) || 12, 15)).map((s: any) => ({
          title: String(s?.title || "Slide"),
          bullets: Array.isArray(s?.bullets) ? s.bullets.map((b: any) => String(b)) : [],
          notes: s?.notes ? String(s.notes) : "",
        }))
      : [];

    return NextResponse.json({ slides: clean });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
