import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Please provide a valid topic." }, { status: 400 });
    }

    const prompt = `
You are an AI that generates **educational, beautiful, multi-layer visual knowledge maps**.

Generate a structured concept map for the topic "${topic}" that helps a student visually understand:
- Root definition
- Causes or origins
- Key elements or components
- Effects or outcomes
- Importance and applications

The output must look **visually logical**, with hierarchical layers.
Each node label must be **meaningful**, **bold**, and **human-readable** — no generic names like "Concept 1" or "Node A".
The structure should clearly represent relationships (arrows/edges) between ideas.

Output ONLY valid JSON in this structure:
{
  "nodes": [
    {"id": "1", "data": {"label": "Root: ${topic}"}, "position": {"x": 0, "y": 0}},
    {"id": "2", "data": {"label": "Definition of ${topic}"}, "position": {"x": -250, "y": 120}},
    {"id": "3", "data": {"label": "Causes of ${topic}"}, "position": {"x": 250, "y": 120}},
    {"id": "4", "data": {"label": "Key Elements"}, "position": {"x": 0, "y": 240}},
    {"id": "5", "data": {"label": "Effects of ${topic}"}, "position": {"x": 250, "y": 360}},
    {"id": "6", "data": {"label": "Importance & Applications"}, "position": {"x": -250, "y": 360}},
    {"id": "7", "data": {"label": "Future Impact"}, "position": {"x": 0, "y": 480}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e1-3", "source": "1", "target": "3"},
    {"id": "e1-4", "source": "1", "target": "4"},
    {"id": "e4-5", "source": "4", "target": "5"},
    {"id": "e4-6", "source": "4", "target": "6"},
    {"id": "e5-7", "source": "5", "target": "7"},
    {"id": "e6-7", "source": "6", "target": "7"}
  ]
}

Return only valid JSON — no markdown, no text outside JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const clean = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Visual Map API Error:", error);
    return NextResponse.json({ error: "Failed to generate visual map." }, { status: 500 });
  }
}
