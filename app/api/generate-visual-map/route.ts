import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json(
        { error: "Missing topic." },
        { status: 400 }
      );
    }

    const prompt = `
Generate a structured JSON object for an AI knowledge map about "${topic}".
Each node must include:
- id (unique short id)
- label (concept title)
- details (2-3 sentence explanation)
Also return edges connecting them logically.
Example format:
{
  "nodes": [
    {"id":"1","label":"Causes","details":"The main reasons ..."},
    {"id":"2","label":"Effects","details":"The consequences ..."}
  ],
  "edges":[{"from":"1","to":"2"}]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Invalid model output." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error("Bad response shape.");
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("visual-map API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error." },
      { status: 500 }
    );
  }
}
