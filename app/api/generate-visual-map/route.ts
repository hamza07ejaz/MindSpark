import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to safely extract JSON from the model output
function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}$/);
  return JSON.parse(match ? match[0] : text);
}

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Please enter a topic." }, { status: 400 });
    }

    const prompt = `
You are an expert concept map builder. Generate a detailed JSON concept map for the topic: "${topic}".

Rules:
- Return only valid JSON.
- Include 10 to 15 interconnected nodes.
- Each node should represent a key concept, cause, effect, importance, or application related to the topic.
- Each edge should clearly describe the relationship between nodes with one of these labels: ["cause", "effect", "importance", "definition", "example", "application", "challenge", "relationship"].
- IDs should be like "n1", "n2", etc. for nodes and "e1", "e2", etc. for edges.
- Ensure the graph forms a meaningful and educational visual map (no random terms).
- Do NOT add any text outside of the JSON.

Return format (no explanation outside JSON):
{
  "nodes": [
    { "id": "n1", "label": "Root Concept of ${topic}" },
    { "id": "n2", "label": "Cause of ${topic}" },
    { "id": "n3", "label": "Effect of ${topic}" }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "label": "cause", "relType": "cause" },
    { "id": "e2", "source": "n1", "target": "n3", "label": "effect", "relType": "effect" }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: "You output only valid JSON following the user's format." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "";
    const parsed = extractJson(raw);

    if (!parsed.nodes || !parsed.edges) {
      throw new Error("Invalid map format received.");
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error: any) {
    console.error("Error generating visual map:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
