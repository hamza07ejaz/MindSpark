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
You are an advanced concept map generator. 
Create a **multi-layer visual knowledge map** for the topic "${topic}" that is visually understandable, beautifully structured, and educational. 
Make it so that a student could quickly understand the entire concept at a glance.

Rules:
- Use **bold, meaningful labels** (no "Concept 1" etc.).
- Include 3 main branches: Causes/Roots, Effects/Consequences, Importance/Applications.
- Each main branch should have 3–5 detailed sub-nodes.
- Maintain clear cause → effect → importance hierarchy.
- Keep total nodes between 12–18.
- Output clean, valid JSON.

Return ONLY this format:

{
  "nodes": [
    {"id": "1", "data": {"label": "Root Topic: ${topic}"}, "position": {"x": 0, "y": 0}},
    {"id": "2", "data": {"label": "Causes of ${topic}"}, "position": {"x": -300, "y": 150}},
    {"id": "3", "data": {"label": "Effects of ${topic}"}, "position": {"x": 300, "y": 150}},
    {"id": "4", "data": {"label": "Importance of ${topic}"}, "position": {"x": 0, "y": 300}},
    {"id": "5", "data": {"label": "Political Causes"}, "position": {"x": -500, "y": 300}},
    {"id": "6", "data": {"label": "Economic Causes"}, "position": {"x": -300, "y": 300}},
    {"id": "7", "data": {"label": "Social Consequences"}, "position": {"x": 300, "y": 300}},
    {"id": "8", "data": {"label": "Technological Advancements"}, "position": {"x": 500, "y": 300}},
    {"id": "9", "data": {"label": "Global Importance"}, "position": {"x": 0, "y": 450}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e1-3", "source": "1", "target": "3"},
    {"id": "e1-4", "source": "1", "target": "4"},
    {"id": "e2-5", "source": "2", "target": "5"},
    {"id": "e2-6", "source": "2", "target": "6"},
    {"id": "e3-7", "source": "3", "target": "7"},
    {"id": "e3-8", "source": "3", "target": "8"},
    {"id": "e4-9", "source": "4", "target": "9"}
  ]
}

Ensure JSON is valid and directly parsable.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
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
