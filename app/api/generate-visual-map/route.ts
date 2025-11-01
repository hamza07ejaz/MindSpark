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
You are a world-class AI concept map creator.
Generate an **informative, educational visual map** for the topic "${topic}" that explains it in depth.

Requirements:
1. Output MUST have **real educational node labels** — no "Concept 1" or placeholders.
2. Organize content into 3 clear branches: Causes/Origins, Effects/Consequences, and Importance/Applications.
3. Each branch should include multiple subtopics (12–16 total nodes).
4. Make every label **clear, meaningful, and concise** (like "Political Causes", "Economic Impact", "Cultural Significance").
5. Ensure JSON is valid and properly formatted.

Return ONLY JSON in this format:
{
  "nodes": [
    {"id": "1", "data": {"label": "Main Topic: ${topic}"}, "position": {"x": 0, "y": 0}},
    {"id": "2", "data": {"label": "Causes of ${topic}"}, "position": {"x": -400, "y": 150}},
    {"id": "3", "data": {"label": "Effects of ${topic}"}, "position": {"x": 400, "y": 150}},
    {"id": "4", "data": {"label": "Importance of ${topic}"}, "position": {"x": 0, "y": 150}}
  ],
  "edges": []
}

After this base structure, expand it by adding around 10–12 **real subnodes** like:
- “Political Causes”
- “Technological Advancements”
- “Environmental Consequences”
- “Social Impact”
- “Future Implications”
Each connected properly using edges.

ONLY return valid JSON — no text, no markdown, no code fences.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    let text = completion.choices[0]?.message?.content?.trim() || "";
    text = text.replace(/```json|```/g, "").trim();

    // Try parsing GPT output safely
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // If GPT fails, fall back to a prebuilt informative example
      parsed = {
        nodes: [
          { id: "1", data: { label: `Main Topic: ${topic}` }, position: { x: 0, y: 0 } },
          { id: "2", data: { label: `Definition of ${topic}` }, position: { x: -400, y: 150 } },
          { id: "3", data: { label: `Causes of ${topic}` }, position: { x: 0, y: 150 } },
          { id: "4", data: { label: `Effects of ${topic}` }, position: { x: 400, y: 150 } },
          { id: "5", data: { label: `Historical Background` }, position: { x: -600, y: 300 } },
          { id: "6", data: { label: `Economic Factors` }, position: { x: -300, y: 300 } },
          { id: "7", data: { label: `Political Impact` }, position: { x: 0, y: 300 } },
          { id: "8", data: { label: `Cultural Significance` }, position: { x: 300, y: 300 } },
          { id: "9", data: { label: `Environmental Consequences` }, position: { x: 600, y: 300 } },
          { id: "10", data: { label: `Modern Relevance` }, position: { x: 0, y: 450 } },
          { id: "11", data: { label: `Future Implications` }, position: { x: 300, y: 450 } }
        ],
        edges: [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e1-3", source: "1", target: "3" },
          { id: "e1-4", source: "1", target: "4" },
          { id: "e3-5", source: "3", target: "5" },
          { id: "e3-6", source: "3", target: "6" },
          { id: "e4-7", source: "4", target: "7" },
          { id: "e4-8", source: "4", target: "8" },
          { id: "e4-9", source: "4", target: "9" },
          { id: "e1-10", source: "1", target: "10" },
          { id: "e10-11", source: "10", target: "11" }
        ]
      };
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Visual Map API Error:", error);
    return NextResponse.json({ error: "Failed to generate visual map." }, { status: 500 });
  }
}
