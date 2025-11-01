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
You are a professional AI knowledge map generator.
Your task is to create a **multi-layer visual concept map** for the topic "${topic}".
The goal is to make it **visually understandable, educational, and logically structured**.

Rules:
1. Each node must contain **real educational text** — no placeholders like "Concept 1".
2. Create 3 main branches: Causes/Roots, Effects/Consequences, Importance/Applications.
3. Each main branch should have 3–5 child concepts that expand on that idea.
4. Each label should be clear, short, and human-understandable (like "Environmental Impact", "Technological Innovation", etc.).
5. Keep total nodes around 12–18 for clarity.
6. Use hierarchical positions (top = root, below = details).
7. Output valid JSON only.

Format:
{
  "nodes": [
    {"id": "1", "data": {"label": "Main Topic: ${topic}"}, "position": {"x": 0, "y": 0}},
    {"id": "2", "data": {"label": "Causes of ${topic}"}, "position": {"x": -400, "y": 150}},
    {"id": "3", "data": {"label": "Effects of ${topic}"}, "position": {"x": 400, "y": 150}},
    {"id": "4", "data": {"label": "Importance of ${topic}"}, "position": {"x": 0, "y": 150}},
    {"id": "5", "data": {"label": "Historical Causes"}, "position": {"x": -600, "y": 300}},
    {"id": "6", "data": {"label": "Economic Factors"}, "position": {"x": -400, "y": 300}},
    {"id": "7", "data": {"label": "Political Reasons"}, "position": {"x": -200, "y": 300}},
    {"id": "8", "data": {"label": "Social Consequences"}, "position": {"x": 400, "y": 300}},
    {"id": "9", "data": {"label": "Environmental Impact"}, "position": {"x": 600, "y": 300}},
    {"id": "10", "data": {"label": "Technological Influence"}, "position": {"x": 200, "y": 300}},
    {"id": "11", "data": {"label": "Global Importance"}, "position": {"x": 0, "y": 450}},
    {"id": "12", "data": {"label": "Applications in Modern World"}, "position": {"x": 200, "y": 450}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e1-3", "source": "1", "target": "3"},
    {"id": "e1-4", "source": "1", "target": "4"},
    {"id": "e2-5", "source": "2", "target": "5"},
    {"id": "e2-6", "source": "2", "target": "6"},
    {"id": "e2-7", "source": "2", "target": "7"},
    {"id": "e3-8", "source": "3", "target": "8"},
    {"id": "e3-9", "source": "3", "target": "9"},
    {"id": "e3-10", "source": "3", "target": "10"},
    {"id": "e4-11", "source": "4", "target": "11"},
    {"id": "e4-12", "source": "4", "target": "12"}
  ]
}

Only return the JSON. No markdown, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
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
