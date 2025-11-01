import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) return NextResponse.json({ error: "Missing topic" }, { status: 400 });

    const prompt = `
You are an AI mind-map generator. Create a structured multi-layer map for the topic "${topic}".
Include clear causes, effects, importance, key ideas, and examples. 
Each node should have a label and be linked logically. Output valid JSON like this:

{
  "nodes": [
    {"id": "1", "data": {"label": "World War 2", "tone": "root"}, "position": {"x":0,"y":0}},
    {"id": "2", "data": {"label": "Causes", "tone": "category"}, "position": {"x":-200,"y":150}},
    {"id": "3", "data": {"label": "Political Tensions", "tone": "cause"}, "position": {"x":-200,"y":300}},
    {"id": "4", "data": {"label": "Consequences", "tone": "effect"}, "position": {"x":200,"y":150}}
  ],
  "edges": [
    {"id": "e1-2","source": "1","target": "2"},
    {"id": "e2-3","source": "2","target": "3"},
    {"id": "e1-4","source": "1","target": "4"}
  ]
}
Keep it under 20 nodes and 20 edges. Return ONLY valid JSON.
    `;

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const text = result.choices[0]?.message?.content?.trim();
    const jsonString = text?.replace(/^```json|```$/g, "").trim();

    const parsed = JSON.parse(jsonString);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate visual map" }, { status: 500 });
  }
}
