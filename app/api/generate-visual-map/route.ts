import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const prompt = `
You are an expert educator and concept visualizer.  
Create a structured, multi-layer AI knowledge map about the topic "${topic}".  
Show clear cause–effect–importance relationships and organize the ideas visually (like a mind map).  
Generate 10–15 nodes with short, meaningful titles that help students instantly understand the key ideas.  
Example node categories to include (if relevant):  
- Definition / Core Concept  
- Causes / Background  
- Effects / Impact  
- Importance / Significance  
- Key Figures / Entities  
- Applications / Modern Relevance  
- Examples / Case Studies  
- Future Outlook  
- Connections to Other Topics  

Return the result **only** as JSON in this structure:
{
  "concepts": [
    { "title": "Definition of AI" },
    { "title": "History and Evolution" },
    { "title": "Key Technologies" },
    { "title": "Applications in Healthcare" },
    { "title": "Ethical Challenges" }
  ]
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content || "";
    const jsonText = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(jsonText);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Error in visual map generation:", error);
    return NextResponse.json(
      { error: "Failed to generate visual map." },
      { status: 500 }
    );
  }
}
