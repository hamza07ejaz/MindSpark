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
You are an AI mind-map generator that creates an informative, multi-layer concept map for the topic "${topic}".  
Your goal is to make it visually understandable and structured logically for students.  
The map should include: causes, effects, importance, key ideas, applications, and examples.  
Output ONLY JSON in this structure:
{
  "nodes": [
    {"id": "1", "data": {"label": "Root Concept", "tone": "root"}, "position": {"x": 0, "y": 0}},
    {"id": "2", "data": {"label": "Cause 1", "tone": "cause"}, "position": {"x": -250, "y": 150}},
    {"id": "3", "data": {"label": "Effect 1", "tone": "effect"}, "position": {"x": 250, "y": 150}},
    {"id": "4", "data": {"label": "Importance", "tone": "importance"}, "position": {"x": -250, "y": 300}},
    {"id": "5", "data": {"label": "Applications", "tone": "application"}, "position": {"x": 250, "y": 300}}
  ],
  "edges": [
    {"id": "e1-2", "source": "1", "target": "2"},
    {"id": "e1-3", "source": "1", "target": "3"},
    {"id": "e2-4", "source": "2", "target": "4"},
    {"id": "e3-5", "source": "3", "target": "5"}
  ]
}
Make sure:
- Each label is concise, meaningful, and relevant.
- JSON is valid and directly parsable.
- Limit to about 15 nodes total.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Visual Map API Error:", error);
    return NextResponse.json({ error: "Failed to generate visual map." }, { status: 500 });
  }
}
